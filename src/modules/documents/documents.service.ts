// src/modules/documents/documents.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDocumentDto, userId: string): Promise<DocumentResponseDto> {
    // Validate DocumentType
    const docType = await this.prisma.documentType.findUnique({
      where: { id: dto.documentTypeId, deletedAt: null },
    });
    if (!docType) {
      throw new NotFoundException('Document type not found');
    }

    const { tags, ...docData } = dto;

    const document = await this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          documentUid: crypto.randomUUID(),
          documentName: docData.documentName,
          documentTypeId: docData.documentTypeId,
          description: docData.description,
          fileName: docData.fileName,
          filePath: docData.filePath,
          fileSize: docData.fileSize ? BigInt(docData.fileSize) : null,
          fileFormat: docData.fileFormat,
          mimeType: docData.mimeType,
          version: docData.version ?? '1.0',
          isLatestVersion: true,
          entityType: docData.entityType,
          entityId: docData.entityId,
          isPublic: docData.isPublic ?? false,
          accessLevel: docData.accessLevel ?? 'internal',
          accessExpiryDate: docData.accessExpiryDate ? new Date(docData.accessExpiryDate) : null,
          status: 'Active',
          uploadedBy: userId,
        },
      });

      if (tags && tags.length > 0) {
        await tx.documentTag.createMany({
          data: tags.map((tagName) => ({
            documentId: doc.id,
            tagName: tagName.trim(),
          })),
          skipDuplicates: true,
        });
      }

      return tx.document.findUnique({
        where: { id: doc.id },
        include: this.getIncludeObject(),
      });
    });

    return this.mapToResponseDto(document);
  }

  async findAll(query: QueryDocumentsDto): Promise<{
    data: DocumentResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      documentTypeId,
      entityType,
      entityId,
      accessLevel,
      isPublic,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.DocumentWhereInput = { deletedAt: null };

    if (documentTypeId) where.documentTypeId = documentTypeId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (accessLevel) where.accessLevel = accessLevel;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { documentName: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, documents] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.getIncludeObject(),
      }),
    ]);

    return {
      data: documents.map((d) => this.mapToResponseDto(d)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
      include: this.getIncludeObject(),
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return this.mapToResponseDto(document);
  }

  async update(
    id: string,
    dto: UpdateDocumentDto,
    userId: string,
  ): Promise<DocumentResponseDto> {
    const existingDoc = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existingDoc) {
      throw new NotFoundException('Document not found');
    }

    if (dto.documentTypeId) {
      const docType = await this.prisma.documentType.findUnique({
        where: { id: dto.documentTypeId, deletedAt: null },
      });
      if (!docType) {
        throw new NotFoundException('Document type not found');
      }
    }

    const { tags, ...docData } = dto;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id },
        data: {
          documentName: docData.documentName,
          documentTypeId: docData.documentTypeId,
          description: docData.description,
          fileName: docData.fileName,
          filePath: docData.filePath,
          fileSize: docData.fileSize ? BigInt(docData.fileSize) : undefined,
          fileFormat: docData.fileFormat,
          mimeType: docData.mimeType,
          version: docData.version,
          entityType: docData.entityType,
          entityId: docData.entityId,
          isPublic: docData.isPublic,
          accessLevel: docData.accessLevel,
          accessExpiryDate: docData.accessExpiryDate ? new Date(docData.accessExpiryDate) : undefined,
          status: docData.status,
          updatedBy: userId,
        },
      });

      if (tags !== undefined) {
        // Simple strategy: delete existing tags and add new ones
        await tx.documentTag.deleteMany({
          where: { documentId: id },
        });

        if (tags.length > 0) {
          await tx.documentTag.createMany({
            data: tags.map((tagName) => ({
              documentId: id,
              tagName: tagName.trim(),
            })),
            skipDuplicates: true,
          });
        }
      }

      return tx.document.findUnique({
        where: { id },
        include: this.getIncludeObject(),
      });
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const existingDoc = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existingDoc) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'Deleted',
      },
    });
  }

  async incrementDownloadCount(id: string): Promise<DocumentResponseDto> {
    const existingDoc = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existingDoc) {
      throw new NotFoundException('Document not found');
    }

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        downloadedCount: {
          increment: 1,
        },
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async createNewVersion(
    id: string,
    dto: CreateDocumentDto,
    userId: string,
  ): Promise<DocumentResponseDto> {
    const oldDocument = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
    if (!oldDocument) {
      throw new NotFoundException('Document not found');
    }

    // Verify type
    const docType = await this.prisma.documentType.findUnique({
      where: { id: dto.documentTypeId, deletedAt: null },
    });
    if (!docType) {
      throw new NotFoundException('Document type not found');
    }

    const { tags, ...docData } = dto;

    const newDocument = await this.prisma.$transaction(async (tx) => {
      // 1. Mark old version as not latest
      await tx.document.update({
        where: { id },
        data: { isLatestVersion: false },
      });

      // 2. Create new version
      const created = await tx.document.create({
        data: {
          documentUid: crypto.randomUUID(),
          documentName: docData.documentName,
          documentTypeId: docData.documentTypeId,
          description: docData.description,
          fileName: docData.fileName,
          filePath: docData.filePath,
          fileSize: docData.fileSize ? BigInt(docData.fileSize) : null,
          fileFormat: docData.fileFormat,
          mimeType: docData.mimeType,
          version: docData.version ?? '1.0',
          isLatestVersion: true,
          previousVersionId: id,
          entityType: docData.entityType ?? oldDocument.entityType,
          entityId: docData.entityId ?? oldDocument.entityId,
          isPublic: docData.isPublic ?? false,
          accessLevel: docData.accessLevel ?? 'internal',
          accessExpiryDate: docData.accessExpiryDate ? new Date(docData.accessExpiryDate) : null,
          status: 'Active',
          uploadedBy: userId,
        },
      });

      // 3. Attach tags
      const tagsToUse = tags !== undefined ? tags : [];
      if (tagsToUse.length > 0) {
        await tx.documentTag.createMany({
          data: tagsToUse.map((tagName) => ({
            documentId: created.id,
            tagName: tagName.trim(),
          })),
          skipDuplicates: true,
        });
      }

      return tx.document.findUnique({
        where: { id: created.id },
        include: this.getIncludeObject(),
      });
    });

    return this.mapToResponseDto(newDocument);
  }

  async getTypes() {
    return this.prisma.documentType.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  // ─── HELPERS ─────────────────────────────────────────────────

  private getIncludeObject() {
    return {
      documentType: true,
      uploader: { select: { id: true, fullName: true, email: true } },
      updater: { select: { id: true, fullName: true, email: true } },
      tags: true,
    };
  }

  private mapToResponseDto(doc: any): DocumentResponseDto {
    return {
      id: doc.id,
      documentUid: doc.documentUid,
      documentName: doc.documentName,
      documentTypeId: doc.documentTypeId,
      documentType: {
        id: doc.documentType.id,
        name: doc.documentType.name,
        description: doc.documentType.description ?? undefined,
      },
      description: doc.description ?? undefined,
      fileName: doc.fileName,
      filePath: doc.filePath,
      fileSize: doc.fileSize != null ? doc.fileSize.toString() : undefined,
      fileFormat: doc.fileFormat ?? undefined,
      mimeType: doc.mimeType ?? undefined,
      version: doc.version ?? undefined,
      isLatestVersion: doc.isLatestVersion,
      previousVersionId: doc.previousVersionId ?? undefined,
      entityType: doc.entityType ?? undefined,
      entityId: doc.entityId ?? undefined,
      isPublic: doc.isPublic,
      accessLevel: doc.accessLevel,
      accessExpiryDate: doc.accessExpiryDate ?? undefined,
      downloadedCount: doc.downloadedCount,
      status: doc.status,
      uploadedBy: doc.uploader,
      updatedBy: doc.updater ?? undefined,
      tags: doc.tags ? doc.tags.map((t: any) => t.tagName) : [],
      createdAt: doc.uploadedAt,
      updatedAt: doc.updatedAt,
    };
  }
}
