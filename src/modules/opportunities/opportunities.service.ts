// src/modules/opportunities/opportunities.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunitiesDto } from './dto/query-opportunities.dto';
import { OpportunityResponseDto } from './dto/opportunity-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createOpportunityDto: CreateOpportunityDto,
    userId: string,
  ): Promise<OpportunityResponseDto> {
    const {
      title,
      dateIdentified,
      partnerName,
      partnerAcronym,
      organizationType,
      country,
      region,
      city,
      website,
      contactPersonName,
      contactPosition,
      contactEmail,
      contactPhone,
      existingRelationship,
      interestArea,
      strategicImportanceLevelId,
      opportunityCategoryId,
      opportunitySourceId,
      opportunityBackground,
      opportunityDescription,
      proposedCollaborationArea,
      expectedOutcome,
      strategicAlignment,
      expectedBenefits,
      partnerId,
      status,
    } = createOpportunityDto;

    // Validate references if provided
    await this.validateReferences(
      strategicImportanceLevelId,
      opportunityCategoryId,
      opportunitySourceId,
      partnerId,
    );

    const opportunity = await this.prisma.partnerOpportunity.create({
      data: {
        opportunityUid: crypto.randomUUID(),
        title,
        dateIdentified: new Date(dateIdentified),
        partnerName,
        partnerAcronym,
        organizationType,
        country,
        region,
        city,
        website,
        contactPersonName,
        contactPosition,
        contactEmail,
        contactPhone,
        existingRelationship,
        interestArea,
        strategicImportanceLevelId,
        opportunityCategoryId,
        opportunitySourceId,
        opportunityBackground,
        opportunityDescription,
        proposedCollaborationArea,
        expectedOutcome,
        strategicAlignment,
        expectedBenefits,
        partnerId,
        status: status || 'Draft',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(opportunity);
  }

  async findAll(query: QueryOpportunitiesDto): Promise<{
    data: OpportunityResponseDto[];
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
      opportunityCategoryId,
      strategicImportanceLevelId,
      opportunitySourceId,
      partnerId,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.PartnerOpportunityWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (opportunityCategoryId) {
      where.opportunityCategoryId = opportunityCategoryId;
    }

    if (strategicImportanceLevelId) {
      where.strategicImportanceLevelId = strategicImportanceLevelId;
    }

    if (opportunitySourceId) {
      where.opportunitySourceId = opportunitySourceId;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (fromDate) {
      where.dateIdentified = { gte: new Date(fromDate) };
    }

    if (toDate) {
      const dateFilter: any = {};
      if (where.dateIdentified) {
        Object.assign(dateFilter, where.dateIdentified);
      }
      dateFilter.lte = new Date(toDate);
      where.dateIdentified = dateFilter;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { partnerName: { contains: search, mode: 'insensitive' } },
        { opportunityDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.partnerOpportunity.count({ where });

    // Get opportunities with pagination
    const opportunities = await this.prisma.partnerOpportunity.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: this.getIncludeObject(),
    });

    const data = opportunities.map((opportunity) =>
      this.mapToResponseDto(opportunity),
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

  async findOne(id: string): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    return this.mapToResponseDto(opportunity);
  }

  async findByUid(uid: string): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { opportunityUid: uid, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    return this.mapToResponseDto(opportunity);
  }

  async update(
    id: string,
    updateOpportunityDto: UpdateOpportunityDto,
  ): Promise<OpportunityResponseDto> {
    const existingOpportunity = await this.prisma.partnerOpportunity.findUnique(
      {
        where: { id, deletedAt: null },
      },
    );

    if (!existingOpportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // If opportunity is already converted, prevent updates
    if (existingOpportunity.status === 'Converted') {
      throw new BadRequestException('Cannot update a converted opportunity');
    }

    const {
      title,
      dateIdentified,
      partnerName,
      partnerAcronym,
      organizationType,
      country,
      region,
      city,
      website,
      contactPersonName,
      contactPosition,
      contactEmail,
      contactPhone,
      existingRelationship,
      interestArea,
      strategicImportanceLevelId,
      opportunityCategoryId,
      opportunitySourceId,
      opportunityBackground,
      opportunityDescription,
      proposedCollaborationArea,
      expectedOutcome,
      strategicAlignment,
      expectedBenefits,
      partnerId,
      status,
    } = updateOpportunityDto;

    // Validate references if provided
    if (
      strategicImportanceLevelId ||
      opportunityCategoryId ||
      opportunitySourceId ||
      partnerId
    ) {
      await this.validateReferences(
        strategicImportanceLevelId,
        opportunityCategoryId,
        opportunitySourceId,
        partnerId,
      );
    }

    const updateData: Prisma.PartnerOpportunityUpdateInput = {
      title,
      dateIdentified: dateIdentified ? new Date(dateIdentified) : undefined,
      partnerName,
      partnerAcronym,
      organizationType,
      country,
      region,
      city,
      website,
      contactPersonName,
      contactPosition,
      contactEmail,
      contactPhone,
      existingRelationship,
      interestArea,
      strategicAlignment,
      expectedBenefits,
      opportunityBackground,
      opportunityDescription,
      proposedCollaborationArea,
      expectedOutcome,
      status,
      updatedAt: new Date(),
    };

    if (strategicImportanceLevelId !== undefined && strategicImportanceLevelId !== null) {
      updateData.strategicImportanceLevel = { connect: { id: strategicImportanceLevelId } };
    }
    if (opportunityCategoryId !== undefined && opportunityCategoryId !== null) {
      updateData.opportunityCategory = { connect: { id: opportunityCategoryId } };
    }
    if (opportunitySourceId !== undefined && opportunitySourceId !== null) {
      updateData.opportunitySource = { connect: { id: opportunitySourceId } };
    }
    if (partnerId !== undefined) {
      updateData.partnerId = partnerId || null;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const opportunity = await this.prisma.partnerOpportunity.update({
      where: { id },
      data: updateData,
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(opportunity);
  }

  async remove(id: string): Promise<void> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status === 'Converted') {
      throw new BadRequestException('Cannot delete a converted opportunity');
    }

    await this.prisma.partnerOpportunity.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
        status: 'Rejected',
      },
    });
  }

  async restore(id: string): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (!opportunity.deletedAt) {
      throw new BadRequestException('Opportunity is not deleted');
    }

    const restored = await this.prisma.partnerOpportunity.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
        status: 'Draft',
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(restored);
  }

  // Workflow Actions

  async screen(id: string): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'Draft') {
      throw new BadRequestException('Only draft opportunities can be screened');
    }

    const updated = await this.prisma.partnerOpportunity.update({
      where: { id },
      data: {
        status: 'Under Review',
        screenedAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async verify(
    id: string,
    verifiedBy: string,
    notes?: string,
  ): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'Under Review') {
      throw new BadRequestException(
        'Only opportunities under review can be verified',
      );
    }

    const updated = await this.prisma.partnerOpportunity.update({
      where: { id },
      data: {
        verifiedBy,
        verificationNotes: notes,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async review(
    id: string,
    reviewedBy: string,
    notes?: string,
  ): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'Under Review') {
      throw new BadRequestException(
        'Only opportunities under review can be reviewed',
      );
    }

    const updated = await this.prisma.partnerOpportunity.update({
      where: { id },
      data: {
        reviewedBy,
        reviewNotes: notes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async approve(id: string, notes?: string): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'Under Review') {
      throw new BadRequestException(
        'Only opportunities under review can be approved',
      );
    }

    const updated = await this.prisma.partnerOpportunity.update({
      where: { id },
      data: {
        status: 'Approved',
        approvalNotes: notes,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async reject(id: string, notes?: string): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'Under Review') {
      throw new BadRequestException(
        'Only opportunities under review can be rejected',
      );
    }

    const updated = await this.prisma.partnerOpportunity.update({
      where: { id },
      data: {
        status: 'Rejected',
        approvalNotes: notes,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async convert(
    id: string,
    entityType: string,
    entityId: string,
  ): Promise<OpportunityResponseDto> {
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id, deletedAt: null },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'Approved') {
      throw new BadRequestException(
        'Only approved opportunities can be converted',
      );
    }

    const updated = await this.prisma.partnerOpportunity.update({
      where: { id },
      data: {
        status: 'Converted',
        convertedToEntityType: entityType,
        convertedToEntityId: entityId,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  private async validateReferences(
    strategicImportanceLevelId?: string,
    opportunityCategoryId?: string,
    opportunitySourceId?: string,
    partnerId?: string,
  ): Promise<void> {
    if (strategicImportanceLevelId) {
      const level = await this.prisma.strategicImportanceLevel.findUnique({
        where: { id: strategicImportanceLevelId },
      });
      if (!level) {
        throw new BadRequestException('Strategic importance level not found');
      }
    }

    if (opportunityCategoryId) {
      const category = await this.prisma.opportunityCategory.findUnique({
        where: { id: opportunityCategoryId },
      });
      if (!category) {
        throw new BadRequestException('Opportunity category not found');
      }
    }

    if (opportunitySourceId) {
      const source = await this.prisma.opportunitySource.findUnique({
        where: { id: opportunitySourceId },
      });
      if (!source) {
        throw new BadRequestException('Opportunity source not found');
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
      strategicImportanceLevel: true,
      opportunityCategory: true,
      opportunitySource: true,
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true,
          position: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          position: true,
        },
      },
      verifier: {
        select: {
          id: true,
          fullName: true,
          email: true,
          position: true,
        },
      },
    };
  }

  private mapToResponseDto(opportunity: any): OpportunityResponseDto {
    return {
      id: opportunity.id,
      opportunityUid: opportunity.opportunityUid,
      title: opportunity.title,
      dateIdentified: opportunity.dateIdentified.toISOString().split('T')[0],
      partnerName: opportunity.partnerName,
      partnerAcronym: opportunity.partnerAcronym,
      organizationType: opportunity.organizationType,
      country: opportunity.country,
      region: opportunity.region,
      city: opportunity.city,
      website: opportunity.website,
      contactPersonName: opportunity.contactPersonName,
      contactPosition: opportunity.contactPosition,
      contactEmail: opportunity.contactEmail,
      contactPhone: opportunity.contactPhone,
      existingRelationship: opportunity.existingRelationship,
      interestArea: opportunity.interestArea,
      strategicImportanceLevel: opportunity.strategicImportanceLevel,
      opportunityCategory: opportunity.opportunityCategory,
      opportunitySource: opportunity.opportunitySource,
      opportunityBackground: opportunity.opportunityBackground,
      opportunityDescription: opportunity.opportunityDescription,
      proposedCollaborationArea: opportunity.proposedCollaborationArea,
      expectedOutcome: opportunity.expectedOutcome,
      strategicAlignment: opportunity.strategicAlignment,
      expectedBenefits: opportunity.expectedBenefits,
      partnerId: opportunity.partnerId,
      status: opportunity.status,
      verificationNotes: opportunity.verificationNotes,
      reviewNotes: opportunity.reviewNotes,
      approvalNotes: opportunity.approvalNotes,
      screenedAt: opportunity.screenedAt,
      verifiedAt: opportunity.verifiedAt,
      reviewedAt: opportunity.reviewedAt,
      approvedAt: opportunity.approvedAt,
      convertedToEntityType: opportunity.convertedToEntityType,
      convertedToEntityId: opportunity.convertedToEntityId,
      createdAt: opportunity.createdAt,
      updatedAt: opportunity.updatedAt,
      createdBy: opportunity.creator,
      reviewedBy: opportunity.reviewer,
      verifiedBy: opportunity.verifier,
    };
  }
}
