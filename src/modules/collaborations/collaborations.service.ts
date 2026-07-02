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
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateJointActivityDto } from './dto/create-joint-activity.dto';
import { CreateFundingGrantDto } from './dto/create-funding-grant.dto';
import { CreateResourceContributionDto } from './dto/create-resource-contribution.dto';
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
    await this.validatePartner(partnerId);

    // Validate agreement if provided
    if (agreementId) {
      await this.validateAgreement(agreementId);
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
    const where: any = {
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
      await this.validatePartner(partnerId);
    }

    // Validate agreement if provided
    if (agreementId) {
      await this.validateAgreement(agreementId);
    }

    const updateData: any = {
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
        rejectionReason: reason,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  // Project methods
  async createProject(
    collaborationId: string,
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<any> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id: collaborationId },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    const projectId = `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const project = await this.prisma.project.create({
      data: {
        projectUid: crypto.randomUUID(),
        projectId,
        collaborationId,
        projectName: createProjectDto.projectName,
        description: createProjectDto.description,
        thematicArea: createProjectDto.thematicArea,
        budget: createProjectDto.budget,
        fundingSource: createProjectDto.fundingSource,
        currency: createProjectDto.currency,
        projectManager: createProjectDto.projectManager,
        partnerLead: createProjectDto.partnerLead,
        teamMembers: createProjectDto.teamMembers,
        startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : null,
        endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : null,
        percentageCompletion: createProjectDto.percentageComplete || 0,
        status: createProjectDto.status || 'Planned',
        partnerId: createProjectDto.partnerId || '',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return project;
  }

  // Joint Activity methods
  async createJointActivity(
    collaborationId: string,
    createJointActivityDto: CreateJointActivityDto,
    userId: string,
  ): Promise<any> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id: collaborationId },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    const activityId = `ACT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const activity = await this.prisma.jointActivity.create({
      data: {
        activityUid: crypto.randomUUID(),
        activityId,
        collaborationId,
        activityName: createJointActivityDto.activityName,
        activityType: createJointActivityDto.activityType,
        description: createJointActivityDto.description,
        startDate: createJointActivityDto.startDate ? new Date(createJointActivityDto.startDate) : null,
        endDate: createJointActivityDto.endDate ? new Date(createJointActivityDto.endDate) : null,
        leadOrganizationId: createJointActivityDto.leadOrganization || '',
        eaiiResponsibleUnit: createJointActivityDto.eaiiResponsibleUnit,
        partnerResponsibleUnit: createJointActivityDto.partnerResponsibleUnit,
        plannedOutputs: createJointActivityDto.plannedOutputs,
        actualOutputs: createJointActivityDto.actualOutputs,
        partnerId: createJointActivityDto.partnerId || '',
        status: 'Planned',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return activity;
  }

  // Funding Grant methods
  async createFundingGrant(
    collaborationId: string,
    createFundingGrantDto: CreateFundingGrantDto,
    userId: string,
  ): Promise<any> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id: collaborationId },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    const grant = await this.prisma.fundingGrant.create({
      data: {
        grantUid: crypto.randomUUID(),
        grantId: createFundingGrantDto.grantId,
        collaborationId,
        partnerId: createFundingGrantDto.partnerId || '',
        donorName: createFundingGrantDto.donorName,
        amount: createFundingGrantDto.amount,
        currency: createFundingGrantDto.currency,
        submissionDate: createFundingGrantDto.submissionDate ? new Date(createFundingGrantDto.submissionDate) : null,
        approvalDate: createFundingGrantDto.approvalDate ? new Date(createFundingGrantDto.approvalDate) : null,
        endDate: createFundingGrantDto.endDate ? new Date(createFundingGrantDto.endDate) : null,
        status: createFundingGrantDto.status || 'Pending',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return grant;
  }

  // Resource Contribution methods
  async createResourceContribution(
    collaborationId: string,
    createResourceContributionDto: CreateResourceContributionDto,
    userId: string,
  ): Promise<any> {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id: collaborationId },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    const contribution = await this.prisma.resourceContribution.create({
      data: {
        resourceUid: crypto.randomUUID(),
        resourceId: createResourceContributionDto.resourceId,
        collaborationId,
        partnerId: createResourceContributionDto.partnerId || '',
        projectId: createResourceContributionDto.projectId || '',
        eaiiStaff: createResourceContributionDto.eaiiStaff,
        eaiiInfrastructure: createResourceContributionDto.eaiiInfrastructure,
        eaiiFunding: createResourceContributionDto.eaiiFunding,
        eaiiEquipment: createResourceContributionDto.eaiiEquipment,
        eaiiDataResources: createResourceContributionDto.eaiiDataResources,
        partnerStaff: createResourceContributionDto.partnerStaff,
        partnerFunding: createResourceContributionDto.partnerFunding,
        partnerTechnology: createResourceContributionDto.partnerTechnology,
        partnerEquipment: createResourceContributionDto.partnerEquipment,
        partnerExpertise: createResourceContributionDto.partnerExpertise,
        estimatedMonetaryValue: createResourceContributionDto.estimatedMonetaryValue,
        estimatedInKindValue: createResourceContributionDto.estimatedInKindValue,
        currency: createResourceContributionDto.currency,
        status: createResourceContributionDto.status || 'Active',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return contribution;
  }

  private async validatePartner(partnerId: string): Promise<void> {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!partner) {
      throw new BadRequestException('Partner not found');
    }
  }

  private async validateAgreement(agreementId: string): Promise<void> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id: agreementId },
    });
    if (!agreement) {
      throw new BadRequestException('Agreement not found');
    }
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
      partner: {
        select: {
          id: true,
          partnerName: true,
          acronym: true,
          country: true,
        },
      },
      agreement: {
        select: {
          id: true,
          agreementId: true,
          agreementTitle: true,
          status: true,
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
      rejectionReason: collaboration.rejectionReason,
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
