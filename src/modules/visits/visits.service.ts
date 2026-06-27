
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisitDto, CreateDelegateDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { QueryVisitsDto } from './dto/query-visits.dto';
import { VisitResponseDto } from './dto/visit-response.dto';
import { CreateVisitOutcomeDto } from './dto/visit-outcome.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createVisitDto: CreateVisitDto,
    userId: string,
  ): Promise<VisitResponseDto> {
    const {
      title,
      visitTypeId,
      visitCategoryId,
      visitDate,
      hostOrganization,
      visitingOrganization,
      visitLocation,
      purpose,
      focalPersonId,
      partnerId,
      status,
      delegates = [],
      outcome,
    } = createVisitDto;

    // Generate record ID: VIS-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.visit.count({
      where: {
        recordId: { startsWith: `VIS-${year}` },
      },
    });
    const recordId = `VIS-${year}-${String(count + 1).padStart(4, '0')}`;

    // Validate references
    await this.validateReferences(
      visitTypeId,
      visitCategoryId,
      focalPersonId,
      partnerId,
    );

    // Validate delegates
    for (const delegate of delegates) {
      if (delegate.email) {
        const existing = await this.prisma.visitDelegationList.findFirst({
          where: {
            email: delegate.email,
            visit: {
              visitDate: {
                equals: new Date(visitDate),
              },
            },
          },
        });
        if (existing) {
          throw new ConflictException(
            `Delegate with email ${delegate.email} already registered for this date`,
          );
        }
      }
    }

    const visit = await this.prisma.visit.create({
      data: {
        visitUid: crypto.randomUUID(),
        recordId,
        title,
        visitTypeId,
        visitCategoryId,
        visitDate: new Date(visitDate),
        hostOrganization,
        visitingOrganization,
        visitLocation,
        purpose,
        focalPersonId,
        partnerId: partnerId || null,
        status: status || 'Planned',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        delegates: {
          create: delegates
            .filter((d) => d.fullName && d.organizationName && d.email)
            .map((d) => ({
              delegateUid: crypto.randomUUID(),
              fullName: d.fullName,
              position: d.position,
              organizationName: d.organizationName,
              country: d.country,
              email: d.email,
              phoneNumber: d.phoneNumber,
              status: d.status || 'Pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
        },
        outcomes: outcome
          ? {
              create: {
                outcomeUid: crypto.randomUUID(),
                keyTopicsDiscussed: outcome.keyTopicsDiscussed,
                opportunitiesIdentified: outcome.opportunitiesIdentified,
                agreementsReached: outcome.agreementsReached,
                followUpActions: outcome.followUpActions,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
          : undefined,
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(visit);
  }

  async findAll(query: QueryVisitsDto): Promise<{
    data: VisitResponseDto[];
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
      visitTypeId,
      visitCategoryId,
      partnerId,
      fromDate,
      toDate,
      sortBy = 'visitDate',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.VisitWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (visitTypeId) {
      where.visitTypeId = visitTypeId;
    }

    if (visitCategoryId) {
      where.visitCategoryId = visitCategoryId;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    const visitDateFilter: Prisma.VisitWhereInput['visitDate'] = {};

    if (fromDate) {
      visitDateFilter.gte = new Date(fromDate);
    }

    if (toDate) {
      visitDateFilter.lte = new Date(toDate);
    }

    if (fromDate || toDate) {
      where.visitDate = visitDateFilter;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { hostOrganization: { contains: search, mode: 'insensitive' } },
        { visitingOrganization: { contains: search, mode: 'insensitive' } },
        { recordId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.visit.count({ where });

    // Get visits with pagination
    const visits = await this.prisma.visit.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: this.getIncludeObject(),
    });

    const data = visits.map((visit) => this.mapToResponseDto(visit));

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

  async findOne(id: string): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return this.mapToResponseDto(visit);
  }

  async findByRecordId(recordId: string): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { recordId, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return this.mapToResponseDto(visit);
  }

  async update(
    id: string,
    updateVisitDto: UpdateVisitDto,
  ): Promise<VisitResponseDto> {
    const existingVisit = await this.prisma.visit.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingVisit) {
      throw new NotFoundException('Visit not found');
    }

    const {
      title,
      visitTypeId,
      visitCategoryId,
      visitDate,
      hostOrganization,
      visitingOrganization,
      visitLocation,
      purpose,
      focalPersonId,
      partnerId,
      status,
    } = updateVisitDto;

    // Validate references if provided
    if (
      visitTypeId ||
      visitCategoryId ||
      focalPersonId ||
      partnerId
    ) {
      await this.validateReferences(
        visitTypeId,
        visitCategoryId,
        focalPersonId,
        partnerId,
      );
    }

    const updateData: Prisma.VisitUpdateInput = {
      title,
      visitDate: visitDate ? new Date(visitDate) : undefined,
      hostOrganization,
      visitingOrganization,
      visitLocation,
      purpose,
      status,
      updatedAt: new Date(),
    };

    if (visitTypeId) {
      updateData.visitType = { connect: { id: visitTypeId } };
    }
    if (visitCategoryId) {
      updateData.visitCategory = { connect: { id: visitCategoryId } };
    }
    if (focalPersonId) {
      updateData.focalPerson = { connect: { id: focalPersonId } };
    }
    if (partnerId !== undefined) {
      updateData.partnerId = partnerId || null;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const visit = await this.prisma.visit.update({
      where: { id },
      data: updateData,
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(visit);
  }

  async remove(id: string): Promise<void> {
    const visit = await this.prisma.visit.findUnique({
      where: { id, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    await this.prisma.visit.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
        status: 'Cancelled',
      },
    });
  }

  async restore(id: string): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    if (!visit.deletedAt) {
      throw new BadRequestException('Visit is not deleted');
    }

    const restored = await this.prisma.visit.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(restored);
  }

  async addDelegate(
    visitId: string,
    delegateData: CreateDelegateDto,
  ): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    // Check for duplicate email
    const existing = await this.prisma.visitDelegationList.findFirst({
      where: {
        visitId,
        email: delegateData.email,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Delegate with this email already registered',
      );
    }

    await this.prisma.visitDelegationList.create({
      data: {
        delegateUid: crypto.randomUUID(),
        visitId,
        fullName: delegateData.fullName,
        position: delegateData.position,
        organizationName: delegateData.organizationName,
        country: delegateData.country,
        email: delegateData.email,
        phoneNumber: delegateData.phoneNumber,
        status: delegateData.status || 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(visitId);
  }

  async removeDelegate(
    visitId: string,
    delegateId: string,
  ): Promise<VisitResponseDto> {
    const delegate = await this.prisma.visitDelegationList.findFirst({
      where: {
        id: delegateId,
        visitId,
        deletedAt: null,
      },
    });

    if (!delegate) {
      throw new NotFoundException('Delegate not found');
    }

    await this.prisma.visitDelegationList.update({
      where: { id: delegateId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(visitId);
  }

  async updateDelegateStatus(
    delegateId: string,
    status: string,
  ): Promise<VisitResponseDto> {
    const delegate = await this.prisma.visitDelegationList.findUnique({
      where: { id: delegateId, deletedAt: null },
      include: { visit: true },
    });

    if (!delegate) {
      throw new NotFoundException('Delegate not found');
    }

    await this.prisma.visitDelegationList.update({
      where: { id: delegateId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return this.findOne(delegate.visitId);
  }

  async createOutcome(
    visitId: string,
    data: CreateVisitOutcomeDto,
  ): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    await this.prisma.visitOutcome.create({
      data: {
        outcomeUid: crypto.randomUUID(),
        visitId,
        keyTopicsDiscussed: data.keyTopicsDiscussed,
        opportunitiesIdentified: data.opportunitiesIdentified,
        agreementsReached: data.agreementsReached,
        followUpActions: data.followUpActions,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(visitId);
  }

  async findOutcomes(visitId: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return this.prisma.visitOutcome.findMany({
      where: { visitId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOutcome(
    visitId: string,
    outcomeId: string,
    data: CreateVisitOutcomeDto,
  ): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    const outcome = await this.prisma.visitOutcome.findFirst({
      where: { id: outcomeId, visitId, deletedAt: null },
    });

    if (!outcome) {
      throw new NotFoundException('Outcome not found');
    }

    await this.prisma.visitOutcome.update({
      where: { id: outcome.id },
      data: {
        keyTopicsDiscussed: data.keyTopicsDiscussed,
        opportunitiesIdentified: data.opportunitiesIdentified,
        agreementsReached: data.agreementsReached,
        followUpActions: data.followUpActions,
        updatedAt: new Date(),
      },
    });

    return this.findOne(visitId);
  }

  async removeOutcome(
    visitId: string,
    outcomeId: string,
  ): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    const outcome = await this.prisma.visitOutcome.findFirst({
      where: { id: outcomeId, visitId, deletedAt: null },
    });

    if (!outcome) {
      throw new NotFoundException('Outcome not found');
    }

    await this.prisma.visitOutcome.update({
      where: { id: outcome.id },
      data: { deletedAt: new Date() },
    });

    return this.findOne(visitId);
  }

  async verifyVisit(
    id: string,
    verifiedBy: string,
    notes?: string,
  ): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    const updated = await this.prisma.visit.update({
      where: { id },
      data: {
        verifiedBy,
        verificationNotes: notes,
        verificationDate: new Date(),
        verifiedStatus: 'verified',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async reviewVisit(
    id: string,
    reviewedBy: string,
    notes?: string,
  ): Promise<VisitResponseDto> {
    const visit = await this.prisma.visit.findUnique({
      where: { id, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    const updated = await this.prisma.visit.update({
      where: { id },
      data: {
        reviewedBy,
        reviewNotes: notes,
        reviewDate: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  private async validateReferences(
    visitTypeId?: string,
    visitCategoryId?: string,
    focalPersonId?: string,
    partnerId?: string,
  ): Promise<void> {
    if (visitTypeId) {
      const type = await this.prisma.visitType.findUnique({
        where: { id: visitTypeId },
      });
      if (!type) {
        throw new BadRequestException('Visit type not found');
      }
    }

    if (visitCategoryId) {
      const category = await this.prisma.visitCategory.findUnique({
        where: { id: visitCategoryId },
      });
      if (!category) {
        throw new BadRequestException('Visit category not found');
      }
    }

    if (focalPersonId) {
      const user = await this.prisma.user.findUnique({
        where: { id: focalPersonId },
      });
      if (!user) {
        throw new BadRequestException('Focal person not found');
      }
    }

    // Commented out until Partner model is added
    // if (partnerId) {
    //   const partner = await this.prisma.partner.findUnique({
    //     where: { id: partnerId },
    //   });
    //   if (!partner) {
    //     throw new BadRequestException('Partner not found');
    //   }
    // }
  }

  private getIncludeObject() {
    return {
      visitType: true,
      visitCategory: true,
      focalPerson: {
        select: {
          id: true,
          fullName: true,
          email: true,
          position: true,
        },
      },
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      verifier: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      delegates: {
        where: { deletedAt: null },
      },
      outcomes: {
        where: { deletedAt: null },
      },
    };
  }

  private mapToResponseDto(visit: any): VisitResponseDto {
    return {
      id: visit.id,
      visitUid: visit.visitUid,
      recordId: visit.recordId,
      title: visit.title,
      visitType: visit.visitType,
      visitCategory: visit.visitCategory,
      visitDate: visit.visitDate.toISOString().split('T')[0],
      hostOrganization: visit.hostOrganization,
      visitingOrganization: visit.visitingOrganization,
      visitLocation: visit.visitLocation,
      purpose: visit.purpose,
      focalPerson: visit.focalPerson,
      partnerId: visit.partnerId,
      status: visit.status,
      verifiedStatus: visit.verifiedStatus,
      reviewNotes: visit.reviewNotes,
      verificationNotes: visit.verificationNotes,
      createdAt: visit.createdAt,
      updatedAt: visit.updatedAt,
      delegates: visit.delegates,
      outcome: visit.outcomes?.[0],
      createdBy: visit.creator,
    };
  }
}
