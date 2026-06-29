// src/modules/communications/communications.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';
import { QueryCommunicationsDto } from './dto/query-communications.dto';
import { CommunicationResponseDto } from './dto/communication-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCommunicationDto: CreateCommunicationDto,
    userId: string,
  ): Promise<CommunicationResponseDto> {
    const {
      opportunityId,
      communicationTypeId,
      emailSubject,
      emailRecipient,
      emailBody,
      sentDate,
      ccRecipients,
      bccRecipients,
      hasAttachments,
    } = createCommunicationDto;

    // Validate opportunity exists
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id: opportunityId, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Validate communication type exists
    const commType = await this.prisma.communicationType.findUnique({
      where: { id: communicationTypeId, deletedAt: null },
    });

    if (!commType) {
      throw new NotFoundException('Communication type not found');
    }

    const communication = await this.prisma.opportunityCommunication.create({
      data: {
        communicationUid: crypto.randomUUID(),
        opportunityId,
        communicationTypeId,
        emailSubject,
        emailRecipient,
        emailBody,
        sentDate: new Date(sentDate),
        ccRecipients,
        bccRecipients,
        hasAttachments: hasAttachments || false,
        sentBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(communication);
  }

  async findAll(query: QueryCommunicationsDto): Promise<{
    data: CommunicationResponseDto[];
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
      opportunityId,
      communicationTypeId,
      fromDate,
      toDate,
      sortBy = 'sentDate',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.OpportunityCommunicationWhereInput = {
      deletedAt: null,
    };

    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    if (communicationTypeId) {
      where.communicationTypeId = communicationTypeId;
    }

    const sentDateFilter: Prisma.OpportunityCommunicationWhereInput['sentDate'] = {};

    if (fromDate) {
      sentDateFilter.gte = new Date(fromDate);
    }

    if (toDate) {
      sentDateFilter.lte = new Date(toDate);
    }

    if (fromDate || toDate) {
      where.sentDate = sentDateFilter;
    }

    // Get total count
    const total = await this.prisma.opportunityCommunication.count({ where });

    // Get communications with pagination
    const communications = await this.prisma.opportunityCommunication.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: this.getIncludeObject(),
    });

    const data = communications.map((comm) => this.mapToResponseDto(comm));

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

  async findOne(id: string): Promise<CommunicationResponseDto> {
    const communication = await this.prisma.opportunityCommunication.findUnique(
      {
        where: { id, deletedAt: null },
        include: this.getIncludeObject(),
      },
    );

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    return this.mapToResponseDto(communication);
  }

  async findByUid(uid: string): Promise<CommunicationResponseDto> {
    const communication = await this.prisma.opportunityCommunication.findUnique(
      {
        where: { communicationUid: uid, deletedAt: null },
        include: this.getIncludeObject(),
      },
    );

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    return this.mapToResponseDto(communication);
  }

  async findByOpportunity(
    opportunityId: string,
  ): Promise<CommunicationResponseDto[]> {
    const communications = await this.prisma.opportunityCommunication.findMany({
      where: {
        opportunityId,
        deletedAt: null,
      },
      include: this.getIncludeObject(),
      orderBy: {
        sentDate: 'desc',
      },
    });

    return communications.map((comm) => this.mapToResponseDto(comm));
  }

  async update(
    id: string,
    updateCommunicationDto: UpdateCommunicationDto,
  ): Promise<CommunicationResponseDto> {
    const existing = await this.prisma.opportunityCommunication.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Communication not found');
    }

    const {
      communicationTypeId,
      emailSubject,
      emailRecipient,
      emailBody,
      sentDate,
      ccRecipients,
      bccRecipients,
      hasAttachments,
    } = updateCommunicationDto;

    // Validate communication type if provided
    if (communicationTypeId) {
      const commType = await this.prisma.communicationType.findUnique({
        where: { id: communicationTypeId, deletedAt: null },
      });
      if (!commType) {
        throw new NotFoundException('Communication type not found');
      }
    }

    const updateData: Prisma.OpportunityCommunicationUpdateInput = {
      emailSubject,
      emailRecipient,
      emailBody,
      sentDate: sentDate ? new Date(sentDate) : undefined,
      ccRecipients,
      bccRecipients,
      hasAttachments,
      updatedAt: new Date(),
    };

    if (communicationTypeId) {
      updateData.communicationType = { connect: { id: communicationTypeId } };
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const communication = await this.prisma.opportunityCommunication.update({
      where: { id },
      data: updateData,
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(communication);
  }

  async remove(id: string): Promise<void> {
    const communication = await this.prisma.opportunityCommunication.findUnique(
      {
        where: { id, deletedAt: null },
      },
    );

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    await this.prisma.opportunityCommunication.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  private getIncludeObject() {
    return {
      communicationType: true,
      sender: {
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
    };
  }

  private mapToResponseDto(communication: any): CommunicationResponseDto {
    return {
      id: communication.id,
      communicationUid: communication.communicationUid,
      opportunityId: communication.opportunityId,
      communicationType: communication.communicationType,
      emailSubject: communication.emailSubject,
      emailRecipient: communication.emailRecipient,
      emailBody: communication.emailBody,
      sentDate: communication.sentDate,
      ccRecipients: communication.ccRecipients,
      bccRecipients: communication.bccRecipients,
      hasAttachments: communication.hasAttachments,
      sentBy: communication.sender,
      createdAt: communication.createdAt,
      updatedAt: communication.updatedAt,
      opportunity: communication.opportunity,
    };
  }
}
