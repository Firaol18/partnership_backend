import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEngagementDto } from './dto/create-engagement.dto';
import { UpdateEngagementDto } from './dto/update-engagement.dto';
import { QueryEngagementsDto } from './dto/query-engagements.dto';
import { EngagementResponseDto } from './dto/engagement-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EngagementsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createEngagementDto: CreateEngagementDto,
    userId: string,
  ): Promise<EngagementResponseDto> {
    const {
      opportunityId,
      engagementTypeId,
      engagementDate,
      title,
      location,
      startTime,
      endTime,
      keyPoints,
      agreedActions,
      nextSteps,
      followUpRequired,
      followUpDate,
      followUpNotes,
      status,
      externalParticipants = [],
      eaiiRepresentatives = [],
    } = createEngagementDto;

    // Validate opportunity exists
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id: opportunityId, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Validate engagement type exists
    const engagementType = await this.prisma.engagementType.findUnique({
      where: { id: engagementTypeId, deletedAt: null },
    });

    if (!engagementType) {
      throw new NotFoundException('Engagement type not found');
    }

    // Generate record ID: ENG-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.engagement.count({
      where: {
        recordId: { startsWith: `ENG-${year}` },
      },
    });
    const recordId = `ENG-${year}-${String(count + 1).padStart(4, '0')}`;

    // Validate EAII representatives
    for (const rep of eaiiRepresentatives) {
      if (rep.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: rep.userId },
        });
        if (!user) {
          throw new BadRequestException(`User with ID ${rep.userId} not found`);
        }
      }
    }

    const engagement = await this.prisma.engagement.create({
      data: {
        engagementUid: crypto.randomUUID(),
        recordId,
        opportunityId,
        engagementTypeId,
        engagementDate: new Date(engagementDate),
        title,
        location,
        startTime: startTime ? new Date(`1970-01-01T${startTime}`) : null,
        endTime: endTime ? new Date(`1970-01-01T${endTime}`) : null,
        keyPoints,
        agreedActions,
        nextSteps,
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        followUpNotes,
        status: status || 'Draft',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        externalParticipants: {
          create: externalParticipants
            .filter((p) => p.fullName && p.organizationName)
            .map((p) => ({
              fullName: p.fullName,
              organizationName: p.organizationName,
              position: p.position,
              email: p.email,
              phoneNumber: p.phoneNumber,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
        },
        eaiiRepresentatives: {
          create: eaiiRepresentatives
            .filter((r) => r.fullName && r.division && r.email)
            .map((r) => ({
              userId: r.userId || null,
              fullName: r.fullName,
              division: r.division,
              email: r.email,
              role: r.role,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
        },
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(engagement);
  }

  async findAll(query: QueryEngagementsDto): Promise<{
    data: EngagementResponseDto[];
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
      opportunityId,
      engagementTypeId,
      fromDate,
      toDate,
      sortBy = 'engagementDate',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.EngagementWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    if (engagementTypeId) {
      where.engagementTypeId = engagementTypeId;
    }

    const engagementDateFilter: Prisma.EngagementWhereInput['engagementDate'] = {};

    if (fromDate) {
      engagementDateFilter.gte = new Date(fromDate);
    }

    if (toDate) {
      engagementDateFilter.lte = new Date(toDate);
    }

    if (fromDate || toDate) {
      where.engagementDate = engagementDateFilter;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { recordId: { contains: search, mode: 'insensitive' } },
        { keyPoints: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.engagement.count({ where });

    // Get engagements with pagination
    const engagements = await this.prisma.engagement.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: this.getIncludeObject(),
    });

    const data = engagements.map((engagement) =>
      this.mapToResponseDto(engagement),
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

  async findOne(id: string): Promise<EngagementResponseDto> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    return this.mapToResponseDto(engagement);
  }

  async findByRecordId(recordId: string): Promise<EngagementResponseDto> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { recordId, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    return this.mapToResponseDto(engagement);
  }

  async findByUid(uid: string): Promise<EngagementResponseDto> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { engagementUid: uid, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    return this.mapToResponseDto(engagement);
  }

  async findByOpportunity(
    opportunityId: string,
  ): Promise<EngagementResponseDto[]> {
    const engagements = await this.prisma.engagement.findMany({
      where: {
        opportunityId,
        deletedAt: null,
      },
      include: this.getIncludeObject(),
      orderBy: {
        engagementDate: 'desc',
      },
    });

    return engagements.map((engagement) => this.mapToResponseDto(engagement));
  }

  async update(
    id: string,
    updateEngagementDto: UpdateEngagementDto,
  ): Promise<EngagementResponseDto> {
    const existing = await this.prisma.engagement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Engagement not found');
    }

    const {
      engagementTypeId,
      engagementDate,
      title,
      location,
      startTime,
      endTime,
      keyPoints,
      agreedActions,
      nextSteps,
      followUpRequired,
      followUpDate,
      followUpNotes,
      status,
    } = updateEngagementDto;

    // Validate engagement type if provided
    if (engagementTypeId) {
      const engagementType = await this.prisma.engagementType.findUnique({
        where: { id: engagementTypeId, deletedAt: null },
      });
      if (!engagementType) {
        throw new NotFoundException('Engagement type not found');
      }
    }

    const updateData: Prisma.EngagementUpdateInput = {
      engagementDate: engagementDate ? new Date(engagementDate) : undefined,
      title,
      location,
      startTime: startTime ? new Date(`1970-01-01T${startTime}`) : undefined,
      endTime: endTime ? new Date(`1970-01-01T${endTime}`) : undefined,
      keyPoints,
      agreedActions,
      nextSteps,
      followUpRequired,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      followUpNotes,
      status,
      updatedAt: new Date(),
    };

    if (engagementTypeId) {
      updateData.engagementType = { connect: { id: engagementTypeId } };
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const engagement = await this.prisma.engagement.update({
      where: { id },
      data: updateData,
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(engagement);
  }

  async approve(
    id: string,
    userId: string,
    notes?: string,
  ): Promise<EngagementResponseDto> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    if (
      engagement.status === 'Completed' ||
      engagement.status === 'Cancelled'
    ) {
      throw new BadRequestException(
        'Cannot approve a completed or cancelled engagement',
      );
    }

    const updated = await this.prisma.engagement.update({
      where: { id },
      data: {
        approvedBy: userId,
        approvalNotes: notes,
        approvalDate: new Date(),
        updatedAt: new Date(),
        status: 'In Progress',
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async complete(id: string, notes?: string): Promise<EngagementResponseDto> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    if (engagement.status === 'Cancelled') {
      throw new BadRequestException('Cannot complete a cancelled engagement');
    }

    const updated = await this.prisma.engagement.update({
      where: { id },
      data: {
        status: 'Completed',
        approvalNotes: notes,
        approvalDate: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async cancel(id: string, notes?: string): Promise<EngagementResponseDto> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    if (engagement.status === 'Completed') {
      throw new BadRequestException('Cannot cancel a completed engagement');
    }

    const updated = await this.prisma.engagement.update({
      where: { id },
      data: {
        status: 'Cancelled',
        approvalNotes: notes,
        approvalDate: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    await this.prisma.engagement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
        status: 'Cancelled',
      },
    });
  }

  async addExternalParticipant(
    engagementId: string,
    participantData: any,
  ): Promise<EngagementResponseDto> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId, deletedAt: null },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    await this.prisma.engagementExternalParticipant.create({
      data: {
        engagementId,
        fullName: participantData.fullName,
        organizationName: participantData.organizationName,
        position: participantData.position,
        email: participantData.email,
        phoneNumber: participantData.phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(engagementId);
  }

  async removeExternalParticipant(
    engagementId: string,
    participantId: string,
  ): Promise<EngagementResponseDto> {
    const participant =
      await this.prisma.engagementExternalParticipant.findFirst({
        where: {
          id: participantId,
          engagementId,
          deletedAt: null,
        },
      });

    if (!participant) {
      throw new NotFoundException('External participant not found');
    }

    await this.prisma.engagementExternalParticipant.update({
      where: { id: participantId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(engagementId);
  }

  async addEaiiRepresentative(
    engagementId: string,
    repData: any,
  ): Promise<EngagementResponseDto> {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId, deletedAt: null },
    });

    if (!engagement) {
      throw new NotFoundException('Engagement not found');
    }

    // Validate user if provided
    if (repData.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: repData.userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
    }

    await this.prisma.engagementEaiiRepresentative.create({
      data: {
        engagementId,
        userId: repData.userId || null,
        fullName: repData.fullName,
        division: repData.division,
        email: repData.email,
        role: repData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(engagementId);
  }

  async removeEaiiRepresentative(
    engagementId: string,
    repId: string,
  ): Promise<EngagementResponseDto> {
    const rep = await this.prisma.engagementEaiiRepresentative.findFirst({
      where: {
        id: repId,
        engagementId,
        deletedAt: null,
      },
    });

    if (!rep) {
      throw new NotFoundException('EAII representative not found');
    }

    await this.prisma.engagementEaiiRepresentative.update({
      where: { id: repId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(engagementId);
  }

  private getIncludeObject() {
    return {
      engagementType: true,
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      opportunity: {
        select: {
          id: true,
          title: true,
          partnerName: true,
        },
      },
      externalParticipants: {
        where: { deletedAt: null },
      },
      eaiiRepresentatives: {
        where: { deletedAt: null },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    };
  }

  private mapToResponseDto(engagement: any): EngagementResponseDto {
    return {
      id: engagement.id,
      engagementUid: engagement.engagementUid,
      recordId: engagement.recordId,
      opportunityId: engagement.opportunityId,
      engagementType: engagement.engagementType,
      engagementDate: engagement.engagementDate.toISOString().split('T')[0],
      title: engagement.title,
      location: engagement.location,
      startTime: engagement.startTime
        ? engagement.startTime.toTimeString().split(' ')[0]
        : undefined,
      endTime: engagement.endTime
        ? engagement.endTime.toTimeString().split(' ')[0]
        : undefined,
      keyPoints: engagement.keyPoints,
      agreedActions: engagement.agreedActions,
      nextSteps: engagement.nextSteps,
      followUpRequired: engagement.followUpRequired,
      followUpDate: engagement.followUpDate
        ? engagement.followUpDate.toISOString().split('T')[0]
        : undefined,
      followUpNotes: engagement.followUpNotes,
      status: engagement.status,
      approvalNotes: engagement.approvalNotes,
      approvalDate: engagement.approvalDate,
      createdAt: engagement.createdAt,
      updatedAt: engagement.updatedAt,
      externalParticipants: engagement.externalParticipants,
      eaiiRepresentatives: engagement.eaiiRepresentatives.map((rep: any) => ({
        ...rep,
        user: rep.user,
      })),
      createdBy: engagement.creator,
      approvedBy: engagement.approver,
      opportunity: engagement.opportunity,
    };
  }
}
