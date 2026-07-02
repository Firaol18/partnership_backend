import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';
import { QueryCollaborationsDto } from './dto/query-collaborations.dto';
import { CollaborationResponseDto } from './dto/collaboration-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CollaborationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCollaborationDto: CreateCollaborationDto,
    userId: string,
  ): Promise<CollaborationResponseDto> {
    const {
      title,
      description,
      collaborationType,
      startDate,
      endDate,
      partnerId,
      agreementId,
      status,
    } = createCollaborationDto;

    // Validate partner exists
    // Note: Partner model not yet implemented in schema, skipping validation for now
    // await this.validatePartner(partnerId);

    // Validate agreement if provided
    if (agreementId) {
      // Note: Agreement model not yet implemented in schema, skipping validation for now
      // await this.validateAgreement(agreementId);
    }

    // Generate collaboration ID: COL-YYYY-XXXX
    const year = new Date().getFullYear();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const collaborationId = `COL-${year}-${randomPart}`;

    const collaboration = await this.prisma.collaboration.create({
      data: {
        collaborationUid: crypto.randomUUID(),
        collaborationId,
        title,
        description,
        collaborationType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        partnerId,
        agreementId,
        status: status || 'Planned',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(collaboration);
  }

  async findAll(query: QueryCollaborationsDto): Promise<{
    data: CollaborationResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      collaborationType,
      partnerId,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.CollaborationWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (collaborationType) {
      where.collaborationType = collaborationType;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (fromDate) {
      where.startDate = { gte: new Date(fromDate) };
    }

    if (toDate) {
      const dateFilter: any = {};
      if (where.startDate) {
        Object.assign(dateFilter, where.startDate);
      }
      dateFilter.lte = new Date(toDate);
      where.startDate = dateFilter;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { collaborationId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.collaboration.count({ where });

    // Get collaborations with pagination
    const collaborations = await this.prisma.collaboration.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: this.getIncludeObject(),
    });

    const data = collaborations.map((collaboration) =>
      this.mapToResponseDto(collaboration),
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<CollaborationResponseDto> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    return this.mapToResponseDto(collaboration);
  }

  async findByUid(uid: string): Promise<CollaborationResponseDto> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { collaborationUid: uid, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    return this.mapToResponseDto(collaboration);
  }

  async findByCollaborationId(
    collaborationId: string,
  ): Promise<CollaborationResponseDto> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { collaborationId, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    return this.mapToResponseDto(collaboration);
  }

  async update(
    id: string,
    updateCollaborationDto: UpdateCollaborationDto,
  ): Promise<CollaborationResponseDto> {
    const existingCollaboration =
      await this.prisma.collaboration.findUnique({
        where: { id, deletedAt: null },
      });

    if (!existingCollaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    const {
      title,
      description,
      collaborationType,
      startDate,
      endDate,
      partnerId,
      agreementId,
      status,
    } = updateCollaborationDto;

    // Validate partner if provided
    if (partnerId) {
      // Note: Partner model not yet implemented in schema, skipping validation for now
      // await this.validatePartner(partnerId);
    }

    // Validate agreement if provided
    if (agreementId) {
      // Note: Agreement model not yet implemented in schema, skipping validation for now
      // await this.validateAgreement(agreementId);
    }

    const updateData: Prisma.CollaborationUpdateInput = {
      title,
      description,
      collaborationType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      partnerId,
      agreementId,
      status,
      updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const collaboration = await this.prisma.collaboration.update({
      where: { id },
      data: updateData,
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(collaboration);
  }

  async remove(id: string): Promise<void> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id, deletedAt: null },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    await this.prisma.collaboration.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
        status: 'Cancelled',
      },
    });
  }

  async restore(id: string): Promise<CollaborationResponseDto> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    if (!collaboration.deletedAt) {
      throw new BadRequestException('Collaboration is not deleted');
    }

    const restored = await this.prisma.collaboration.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
        status: 'Planned',
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(restored);
  }

  // Workflow Actions

  async approve(
    id: string,
    userId: string,
    notes?: string,
  ): Promise<CollaborationResponseDto> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id, deletedAt: null },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    if (collaboration.status !== 'Planned') {
      throw new BadRequestException(
        'Only planned collaborations can be approved',
      );
    }

    // Update status to Ongoing when approved
    const updated = await this.prisma.collaboration.update({
      where: { id },
      data: {
        status: 'Ongoing',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async complete(id: string): Promise<CollaborationResponseDto> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id, deletedAt: null },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    if (collaboration.status !== 'Ongoing') {
      throw new BadRequestException(
        'Only ongoing collaborations can be completed',
      );
    }

    const updated = await this.prisma.collaboration.update({
      where: { id },
      data: {
        status: 'Completed',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async delay(id: string, reason?: string): Promise<CollaborationResponseDto> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id, deletedAt: null },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    if (collaboration.status !== 'Ongoing') {
      throw new BadRequestException(
        'Only ongoing collaborations can be delayed',
      );
    }

    const updated = await this.prisma.collaboration.update({
      where: { id },
      data: {
        status: 'Delayed',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async cancel(id: string, reason?: string): Promise<CollaborationResponseDto> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id, deletedAt: null },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    const updated = await this.prisma.collaboration.update({
      where: { id },
      data: {
        status: 'Cancelled',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  private getIncludeObject() {
    return {
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true,
          position: true,
        },
      },
      jointActivities: true,
      projects: true,
      resourceContributions: true,
      fundingGrants: true,
    };
  }

  private mapToResponseDto(collaboration: any): CollaborationResponseDto {
    return {
      id: collaboration.id,
      collaborationUid: collaboration.collaborationUid,
      collaborationId: collaboration.collaborationId,
      title: collaboration.title,
      description: collaboration.description,
      collaborationType: collaboration.collaborationType,
      startDate: collaboration.startDate
        ? collaboration.startDate.toISOString().split('T')[0]
        : null,
      endDate: collaboration.endDate
        ? collaboration.endDate.toISOString().split('T')[0]
        : null,
      status: collaboration.status,
      partnerId: collaboration.partnerId,
      agreementId: collaboration.agreementId,
      createdAt: collaboration.createdAt,
      updatedAt: collaboration.updatedAt,
      deletedAt: collaboration.deletedAt,
      createdBy: collaboration.creator,
      jointActivities: collaboration.jointActivities,
      projects: collaboration.projects,
      resourceContributions: collaboration.resourceContributions,
      fundingGrants: collaboration.fundingGrants,
    };
  }
}
