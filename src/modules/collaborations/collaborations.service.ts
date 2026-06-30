// src/modules/collaborations/collaborations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';
import { QueryCollaborationsDto } from './dto/query-collaborations.dto';
import {
  CollaborationResponseDto,
  JointActivityResponseDto,
  ActivityOutputResponseDto,
} from './dto/collaboration-response.dto';
import { CreateJointActivityDto } from './dto/create-joint-activity.dto';
import { UpdateJointActivityDto } from './dto/update-joint-activity.dto';
import { ReviewJointActivityDto } from './dto/review-joint-activity.dto';
import { ApproveJointActivityDto } from './dto/approve-joint-activity.dto';
import { CreateActivityOutputDto } from './dto/create-activity-output.dto';
import { UpdateActivityOutputDto } from './dto/update-activity-output.dto';

// Phase 2 DTOs
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { ApproveProjectDto } from './dto/approve-project.dto';
import { CreateProjectMilestoneDto } from './dto/create-project-milestone.dto';
import { UpdateProjectMilestoneDto } from './dto/update-project-milestone.dto';
import { CreateProjectDeliverableDto } from './dto/create-project-deliverable.dto';
import { UpdateProjectDeliverableDto } from './dto/update-project-deliverable.dto';
import { CreateProjectRiskDto } from './dto/create-project-risk.dto';
import { UpdateProjectRiskDto } from './dto/update-project-risk.dto';
import { CreateResourceContributionDto } from './dto/create-resource-contribution.dto';
import { UpdateResourceContributionDto } from './dto/update-resource-contribution.dto';
import { QueryResourceContributionsDto } from './dto/query-resource-contributions.dto';

import {
  ProjectResponseDto,
  ProjectMilestoneResponseDto,
  ProjectDeliverableResponseDto,
  ProjectRiskResponseDto,
} from './dto/project-response.dto';
import { ResourceContributionResponseDto } from './dto/resource-contribution-response.dto';

// Phase 3 DTOs
import { CreateFundingGrantDto } from './dto/create-funding-grant.dto';
import { UpdateFundingGrantDto } from './dto/update-funding-grant.dto';
import { QueryFundingGrantsDto } from './dto/query-funding-grants.dto';
import { CreateGrantDisbursementDto } from './dto/create-grant-disbursement.dto';
import { UpdateGrantDisbursementDto } from './dto/update-grant-disbursement.dto';
import { CreateCollaborationDocumentDto } from './dto/create-collaboration-document.dto';
import { UpdateCollaborationDocumentDto } from './dto/update-collaboration-document.dto';
import {
  FundingGrantResponseDto,
  GrantDisbursementResponseDto,
  CollaborationDocumentResponseDto,
  ApprovalHistoryResponseDto,
} from './dto/funding-grant-response.dto';

import { Prisma } from '@prisma/client';

@Injectable()
export class CollaborationsService {
  constructor(private prisma: PrismaService) {}

  // =========================================================================
  // COLLABORATIONS
  // =========================================================================

  async createCollaboration(
    dto: CreateCollaborationDto,
    userId: string,
  ): Promise<CollaborationResponseDto> {
    // Validate partner
    const partner = await this.prisma.partner.findFirst({
      where: { id: dto.partnerId, deletedAt: null },
    });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Validate agreement if provided
    if (dto.agreementId) {
      const agreement = await this.prisma.agreement.findFirst({
        where: { id: dto.agreementId, deletedAt: null },
      });
      if (!agreement) {
        throw new NotFoundException('Agreement not found');
      }
    }

    // Generate unique collaboration ID: COL-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.collaboration.count({
      where: { collaborationId: { startsWith: `COL-${year}` } },
    });
    const collaborationId = `COL-${year}-${String(count + 1).padStart(4, '0')}`;

    const collab = await this.prisma.collaboration.create({
      data: {
        collaborationUid: crypto.randomUUID(),
        collaborationId,
        partnerId: dto.partnerId,
        agreementId: dto.agreementId || null,
        title: dto.title,
        description: dto.description || null,
        collaborationType: dto.collaborationType,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status || 'Planned',
        createdById: userId,
      },
      include: this.getCollaborationInclude(),
    });

    return this.mapToCollaborationResponse(collab);
  }

  async findAllCollaborations(query: QueryCollaborationsDto): Promise<{
    data: CollaborationResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      partnerId,
      agreementId,
      collaborationType,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.CollaborationWhereInput = { deletedAt: null };

    if (partnerId) where.partnerId = partnerId;
    if (agreementId) where.agreementId = agreementId;
    if (collaborationType) where.collaborationType = collaborationType;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { collaborationId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.collaboration.count({ where }),
      this.prisma.collaboration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.getCollaborationInclude(),
      }),
    ]);

    return {
      data: items.map((c) => this.mapToCollaborationResponse(c)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneCollaboration(id: string): Promise<CollaborationResponseDto> {
    const collab = await this.prisma.collaboration.findFirst({
      where: { id, deletedAt: null },
      include: this.getCollaborationInclude(),
    });
    if (!collab) {
      throw new NotFoundException('Collaboration not found');
    }
    return this.mapToCollaborationResponse(collab);
  }

  async updateCollaboration(
    id: string,
    dto: UpdateCollaborationDto,
    userId: string,
  ): Promise<CollaborationResponseDto> {
    const collab = await this.prisma.collaboration.findFirst({
      where: { id, deletedAt: null },
    });
    if (!collab) {
      throw new NotFoundException('Collaboration not found');
    }

    if (dto.partnerId) {
      const partner = await this.prisma.partner.findFirst({
        where: { id: dto.partnerId, deletedAt: null },
      });
      if (!partner) throw new NotFoundException('Partner not found');
    }

    if (dto.agreementId) {
      const agreement = await this.prisma.agreement.findFirst({
        where: { id: dto.agreementId, deletedAt: null },
      });
      if (!agreement) throw new NotFoundException('Agreement not found');
    }

    const updated = await this.prisma.collaboration.update({
      where: { id },
      data: {
        partnerId: dto.partnerId,
        agreementId: dto.agreementId,
        title: dto.title,
        description: dto.description,
        collaborationType: dto.collaborationType,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
      include: this.getCollaborationInclude(),
    });

    return this.mapToCollaborationResponse(updated);
  }

  async removeCollaboration(id: string): Promise<void> {
    const collab = await this.prisma.collaboration.findFirst({
      where: { id, deletedAt: null },
    });
    if (!collab) {
      throw new NotFoundException('Collaboration not found');
    }

    // Set deletedAt on collaboration and its activities
    await this.prisma.$transaction([
      this.prisma.collaboration.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'Cancelled' },
      }),
      this.prisma.jointActivity.updateMany({
        where: { collaborationId: id },
        data: { deletedAt: new Date(), status: 'Cancelled' },
      }),
    ]);
  }

  // =========================================================================
  // JOINT ACTIVITIES
  // =========================================================================

  async createActivity(
    collaborationId: string,
    dto: CreateJointActivityDto,
    userId: string,
  ): Promise<JointActivityResponseDto> {
    // Validate collaboration
    const collab = await this.prisma.collaboration.findFirst({
      where: { id: collaborationId, deletedAt: null },
    });
    if (!collab) {
      throw new NotFoundException('Collaboration not found');
    }

    // Validate partner
    const partner = await this.prisma.partner.findFirst({
      where: { id: dto.partnerId, deletedAt: null },
    });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Validate lead organization
    const leadOrg = await this.prisma.partner.findFirst({
      where: { id: dto.leadOrganizationId, deletedAt: null },
    });
    if (!leadOrg) {
      throw new NotFoundException('Lead organization not found');
    }

    // Generate unique activity ID: ACT-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.jointActivity.count({
      where: { activityId: { startsWith: `ACT-${year}` } },
    });
    const activityId = `ACT-${year}-${String(count + 1).padStart(4, '0')}`;

    const activity = await this.prisma.jointActivity.create({
      data: {
        activityUid: crypto.randomUUID(),
        activityId,
        collaborationId,
        partnerId: dto.partnerId,
        activityName: dto.activityName,
        activityType: dto.activityType,
        description: dto.description || null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        leadOrganizationId: dto.leadOrganizationId,
        eaiiResponsibleUnit: dto.eaiiResponsibleUnit,
        partnerResponsibleUnit: dto.partnerResponsibleUnit || null,
        plannedOutputs: dto.plannedOutputs || null,
        actualOutputs: dto.actualOutputs || null,
        status: dto.status || 'Planned',
        createdById: userId,
        approvalStatus: 'pending',
        verifiedStatus: 'pending',
      },
      include: this.getJointActivityInclude(),
    });

    return this.mapToJointActivityResponse(activity);
  }

  async findAllActivities(
    collaborationId: string,
    query: any,
  ): Promise<{
    data: JointActivityResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      activityType,
      status,
      approvalStatus,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.JointActivityWhereInput = {
      collaborationId,
      deletedAt: null,
    };

    if (activityType) where.activityType = activityType;
    if (status) where.status = status;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    if (search) {
      where.OR = [
        { activityName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { activityId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.jointActivity.count({ where }),
      this.prisma.jointActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.getJointActivityInclude(),
      }),
    ]);

    return {
      data: items.map((a) => this.mapToJointActivityResponse(a)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneActivity(id: string): Promise<JointActivityResponseDto> {
    const activity = await this.prisma.jointActivity.findFirst({
      where: { id, deletedAt: null },
      include: this.getJointActivityInclude(),
    });
    if (!activity) {
      throw new NotFoundException('Joint Activity not found');
    }
    return this.mapToJointActivityResponse(activity);
  }

  async updateActivity(
    id: string,
    dto: UpdateJointActivityDto,
    userId: string,
  ): Promise<JointActivityResponseDto> {
    const activity = await this.prisma.jointActivity.findFirst({
      where: { id, deletedAt: null },
    });
    if (!activity) {
      throw new NotFoundException('Joint Activity not found');
    }

    if (dto.partnerId) {
      const partner = await this.prisma.partner.findFirst({
        where: { id: dto.partnerId, deletedAt: null },
      });
      if (!partner) throw new NotFoundException('Partner not found');
    }

    if (dto.leadOrganizationId) {
      const leadOrg = await this.prisma.partner.findFirst({
        where: { id: dto.leadOrganizationId, deletedAt: null },
      });
      if (!leadOrg) throw new NotFoundException('Lead organization not found');
    }

    const updated = await this.prisma.jointActivity.update({
      where: { id },
      data: {
        partnerId: dto.partnerId,
        activityName: dto.activityName,
        activityType: dto.activityType,
        description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        leadOrganizationId: dto.leadOrganizationId,
        eaiiResponsibleUnit: dto.eaiiResponsibleUnit,
        partnerResponsibleUnit: dto.partnerResponsibleUnit,
        plannedOutputs: dto.plannedOutputs,
        actualOutputs: dto.actualOutputs,
        status: dto.status,
      },
      include: this.getJointActivityInclude(),
    });

    return this.mapToJointActivityResponse(updated);
  }

  async removeActivity(id: string): Promise<void> {
    const activity = await this.prisma.jointActivity.findFirst({
      where: { id, deletedAt: null },
    });
    if (!activity) {
      throw new NotFoundException('Joint Activity not found');
    }

    await this.prisma.jointActivity.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'Cancelled' },
    });
  }

  // ─── Approval Workflow ──────────────────────────────────────────

  async reviewActivity(
    id: string,
    dto: ReviewJointActivityDto,
    reviewerId: string,
  ): Promise<JointActivityResponseDto> {
    const activity = await this.prisma.jointActivity.findFirst({
      where: { id, deletedAt: null },
    });
    if (!activity) throw new NotFoundException('Joint Activity not found');

    const updated = await this.prisma.jointActivity.update({
      where: { id },
      data: {
        reviewedById: reviewerId,
        reviewNotes: dto.notes || null,
        reviewDate: new Date(),
      },
      include: this.getJointActivityInclude(),
    });

    await this.logApprovalAction('activity', id, 'reviewed', reviewerId, dto.notes);
    return this.mapToJointActivityResponse(updated);
  }

  async verifyActivity(
    id: string,
    dto: ReviewJointActivityDto,
    verifierId: string,
  ): Promise<JointActivityResponseDto> {
    const activity = await this.prisma.jointActivity.findFirst({
      where: { id, deletedAt: null },
    });
    if (!activity) throw new NotFoundException('Joint Activity not found');

    const updated = await this.prisma.jointActivity.update({
      where: { id },
      data: {
        verifiedById: verifierId,
        verificationNotes: dto.notes || null,
        verificationDate: new Date(),
        verifiedStatus: dto.status,
      },
      include: this.getJointActivityInclude(),
    });

    await this.logApprovalAction('activity', id, 'verified', verifierId, dto.notes);
    return this.mapToJointActivityResponse(updated);
  }

  async approveActivity(
    id: string,
    dto: ApproveJointActivityDto,
    approverId: string,
  ): Promise<JointActivityResponseDto> {
    const activity = await this.prisma.jointActivity.findFirst({
      where: { id, deletedAt: null },
    });
    if (!activity) throw new NotFoundException('Joint Activity not found');

    const updated = await this.prisma.jointActivity.update({
      where: { id },
      data: {
        approvedById: approverId,
        approvalReason: dto.reason || null,
        approvedAt: new Date(),
        approvalStatus: dto.status,
      },
      include: this.getJointActivityInclude(),
    });

    await this.logApprovalAction('activity', id, dto.status === 'approved' ? 'approved' : 'rejected', approverId, undefined, dto.reason);
    return this.mapToJointActivityResponse(updated);
  }

  // =========================================================================
  // ACTIVITY OUTPUTS (9.3)
  // =========================================================================

  async createOutput(
    activityId: string,
    dto: CreateActivityOutputDto,
  ): Promise<ActivityOutputResponseDto> {
    const activity = await this.prisma.jointActivity.findFirst({
      where: { id: activityId, deletedAt: null },
    });
    if (!activity) {
      throw new NotFoundException('Joint Activity not found');
    }

    const output = await this.prisma.activityOutput.create({
      data: {
        outputUid: crypto.randomUUID(),
        activityId,
        outputType: dto.outputType,
        outputDescription: dto.outputDescription,
        quantity: dto.quantity || null,
        unit: dto.unit || null,
        completionDate: dto.completionDate ? new Date(dto.completionDate) : null,
        status: dto.status || 'pending',
      },
    });

    return this.mapToOutputResponse(output);
  }

  async findOutputs(activityId: string): Promise<ActivityOutputResponseDto[]> {
    const activity = await this.prisma.jointActivity.findFirst({
      where: { id: activityId, deletedAt: null },
    });
    if (!activity) {
      throw new NotFoundException('Joint Activity not found');
    }

    const outputs = await this.prisma.activityOutput.findMany({
      where: { activityId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    return outputs.map((o) => this.mapToOutputResponse(o));
  }

  async updateOutput(
    outputId: string,
    dto: UpdateActivityOutputDto,
  ): Promise<ActivityOutputResponseDto> {
    const output = await this.prisma.activityOutput.findFirst({
      where: { id: outputId, deletedAt: null },
    });
    if (!output) {
      throw new NotFoundException('Activity Output not found');
    }

    const updated = await this.prisma.activityOutput.update({
      where: { id: outputId },
      data: {
        outputType: dto.outputType,
        outputDescription: dto.outputDescription,
        quantity: dto.quantity,
        unit: dto.unit,
        completionDate: dto.completionDate ? new Date(dto.completionDate) : undefined,
        status: dto.status,
      },
    });

    return this.mapToOutputResponse(updated);
  }

  async removeOutput(outputId: string): Promise<void> {
    const output = await this.prisma.activityOutput.findFirst({
      where: { id: outputId, deletedAt: null },
    });
    if (!output) {
      throw new NotFoundException('Activity Output not found');
    }

    await this.prisma.activityOutput.update({
      where: { id: outputId },
      data: { deletedAt: new Date() },
    });
  }

  // ─── HELPERS ─────────────────────────────────────────────────

  private getCollaborationInclude() {
    return {
      partner: { select: { id: true, partnerName: true, partnerId: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
      _count: { select: { activities: true } },
    };
  }

  private getJointActivityInclude() {
    return {
      partner: { select: { id: true, partnerName: true, partnerId: true } },
      leadOrganization: { select: { id: true, partnerName: true, partnerId: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
      approvedBy: { select: { id: true, fullName: true, email: true } },
      reviewer: { select: { id: true, fullName: true, email: true } },
      verifier: { select: { id: true, fullName: true, email: true } },
      outputs: { where: { deletedAt: null } },
    };
  }

  private mapToCollaborationResponse(col: any): CollaborationResponseDto {
    return {
      id: col.id,
      collaborationUid: col.collaborationUid,
      collaborationId: col.collaborationId,
      partnerId: col.partnerId,
      partner: col.partner,
      agreementId: col.agreementId ?? undefined,
      title: col.title,
      description: col.description ?? undefined,
      collaborationType: col.collaborationType,
      startDate: col.startDate ?? undefined,
      endDate: col.endDate ?? undefined,
      status: col.status,
      createdBy: col.createdBy,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
      _count: col._count,
    };
  }

  private mapToJointActivityResponse(act: any): JointActivityResponseDto {
    return {
      id: act.id,
      activityUid: act.activityUid,
      activityId: act.activityId,
      collaborationId: act.collaborationId,
      partnerId: act.partnerId,
      partner: act.partner,
      activityName: act.activityName,
      activityType: act.activityType,
      description: act.description ?? undefined,
      startDate: act.startDate ?? undefined,
      endDate: act.endDate ?? undefined,
      leadOrganizationId: act.leadOrganizationId,
      leadOrganization: act.leadOrganization,
      eaiiResponsibleUnit: act.eaiiResponsibleUnit,
      partnerResponsibleUnit: act.partnerResponsibleUnit ?? undefined,
      plannedOutputs: act.plannedOutputs,
      actualOutputs: act.actualOutputs,
      approvalStatus: act.approvalStatus,
      approvalReason: act.approvalReason ?? undefined,
      approvedBy: act.approvedBy ?? undefined,
      approvedAt: act.approvedAt ?? undefined,
      reviewer: act.reviewer ?? undefined,
      reviewNotes: act.reviewNotes ?? undefined,
      reviewDate: act.reviewDate ?? undefined,
      verifier: act.verifier ?? undefined,
      verificationNotes: act.verificationNotes ?? undefined,
      verificationDate: act.verificationDate ?? undefined,
      verifiedStatus: act.verifiedStatus,
      status: act.status,
      createdBy: act.createdBy,
      createdAt: act.createdAt,
      updatedAt: act.updatedAt,
      outputs: act.outputs ? act.outputs.map((o: any) => this.mapToOutputResponse(o)) : [],
    };
  }

  private mapToOutputResponse(out: any): ActivityOutputResponseDto {
    return {
      id: out.id,
      outputUid: out.outputUid,
      activityId: out.activityId,
      outputType: out.outputType,
      outputDescription: out.outputDescription,
      quantity: out.quantity ?? undefined,
      unit: out.unit ?? undefined,
      completionDate: out.completionDate ?? undefined,
      status: out.status,
      createdAt: out.createdAt,
      updatedAt: out.updatedAt,
    };
  }

  // =========================================================================
  // PROJECTS (9.4)
  // =========================================================================

  async createProject(
    collaborationId: string,
    dto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    // Validate collaboration
    const collab = await this.prisma.collaboration.findFirst({
      where: { id: collaborationId, deletedAt: null },
    });
    if (!collab) throw new NotFoundException('Collaboration not found');

    // Validate partner
    const partner = await this.prisma.partner.findFirst({
      where: { id: dto.partnerId, deletedAt: null },
    });
    if (!partner) throw new NotFoundException('Partner not found');

    // Generate unique project ID: PRJ-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.project.count({
      where: { projectId: { startsWith: `PRJ-${year}` } },
    });
    const projectId = `PRJ-${year}-${String(count + 1).padStart(4, '0')}`;

    const project = await this.prisma.project.create({
      data: {
        projectUid: crypto.randomUUID(),
        projectId,
        collaborationId,
        partnerId: dto.partnerId,
        projectName: dto.projectName,
        description: dto.description || null,
        thematicArea: dto.thematicArea || null,
        budget: dto.budget ? new Prisma.Decimal(dto.budget) : null,
        fundingSource: dto.fundingSource || null,
        currency: dto.currency || null,
        projectManager: dto.projectManager || null,
        partnerLead: dto.partnerLead || null,
        teamMembers: dto.teamMembers ? (dto.teamMembers as any) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        percentageCompletion: dto.percentageCompletion ? new Prisma.Decimal(dto.percentageCompletion) : new Prisma.Decimal(0.00),
        milestonesSummary: dto.milestonesSummary ? (dto.milestonesSummary as any) : null,
        deliverablesSummary: dto.deliverablesSummary ? (dto.deliverablesSummary as any) : null,
        risksSummary: dto.risksSummary ? (dto.risksSummary as any) : null,
        status: dto.status || 'Planned',
        approvalStatus: 'pending',
        createdById: userId,
      },
      include: this.getProjectInclude(),
    });

    return this.mapToProjectResponse(project);
  }

  async findAllProjects(
    collaborationId: string,
    query: QueryProjectsDto,
  ): Promise<{
    data: ProjectResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      thematicArea,
      status,
      approvalStatus,
      partnerId,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ProjectWhereInput = {
      collaborationId,
      deletedAt: null,
    };

    if (thematicArea) where.thematicArea = thematicArea;
    if (status) where.status = status;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (partnerId) where.partnerId = partnerId;

    if (search) {
      where.OR = [
        { projectName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { projectId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.getProjectInclude(),
      }),
    ]);

    return {
      data: items.map((p) => this.mapToProjectResponse(p)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneProject(id: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: this.getProjectInclude(),
    });
    if (!project) throw new NotFoundException('Project not found');
    return this.mapToProjectResponse(project);
  }

  async updateProject(
    id: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (dto.partnerId) {
      const partner = await this.prisma.partner.findFirst({
        where: { id: dto.partnerId, deletedAt: null },
      });
      if (!partner) throw new NotFoundException('Partner not found');
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        partnerId: dto.partnerId,
        projectName: dto.projectName,
        description: dto.description,
        thematicArea: dto.thematicArea,
        budget: dto.budget ? new Prisma.Decimal(dto.budget) : undefined,
        fundingSource: dto.fundingSource,
        currency: dto.currency,
        projectManager: dto.projectManager,
        partnerLead: dto.partnerLead,
        teamMembers: dto.teamMembers ? (dto.teamMembers as any) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        percentageCompletion: dto.percentageCompletion ? new Prisma.Decimal(dto.percentageCompletion) : undefined,
        milestonesSummary: dto.milestonesSummary ? (dto.milestonesSummary as any) : undefined,
        deliverablesSummary: dto.deliverablesSummary ? (dto.deliverablesSummary as any) : undefined,
        risksSummary: dto.risksSummary ? (dto.risksSummary as any) : undefined,
        status: dto.status,
      },
      include: this.getProjectInclude(),
    });

    return this.mapToProjectResponse(updated);
  }

  async removeProject(id: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'Cancelled' },
    });
  }

  async approveProject(
    id: string,
    dto: ApproveProjectDto,
    approverId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        approvedById: approverId,
        approvalReason: dto.reason || null,
        approvedAt: new Date(),
        approvalStatus: dto.status, // approved | rejected
      },
      include: this.getProjectInclude(),
    });

    await this.logApprovalAction('project', id, dto.status === 'approved' ? 'approved' : 'rejected', approverId, undefined, dto.reason);
    return this.mapToProjectResponse(updated);
  }

  // =========================================================================
  // PROJECT MILESTONES (9.5)
  // =========================================================================

  async createProjectMilestone(
    projectId: string,
    dto: CreateProjectMilestoneDto,
  ): Promise<ProjectMilestoneResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    const milestone = await this.prisma.projectMilestone.create({
      data: {
        milestoneUid: crypto.randomUUID(),
        projectId,
        milestoneName: dto.milestoneName,
        description: dto.description || null,
        dueDate: new Date(dto.dueDate),
        completionDate: dto.completionDate ? new Date(dto.completionDate) : null,
        status: dto.status || 'pending',
        percentageComplete: dto.percentageComplete ? new Prisma.Decimal(dto.percentageComplete) : new Prisma.Decimal(0.00),
      },
    });

    return this.mapToMilestoneResponse(milestone);
  }

  async updateProjectMilestone(
    milestoneId: string,
    dto: UpdateProjectMilestoneDto,
  ): Promise<ProjectMilestoneResponseDto> {
    const milestone = await this.prisma.projectMilestone.findFirst({
      where: { id: milestoneId, deletedAt: null },
    });
    if (!milestone) throw new NotFoundException('Project Milestone not found');

    const updated = await this.prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        milestoneName: dto.milestoneName,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completionDate: dto.completionDate ? new Date(dto.completionDate) : undefined,
        status: dto.status,
        percentageComplete: dto.percentageComplete ? new Prisma.Decimal(dto.percentageComplete) : undefined,
      },
    });

    return this.mapToMilestoneResponse(updated);
  }

  async removeProjectMilestone(milestoneId: string): Promise<void> {
    const milestone = await this.prisma.projectMilestone.findFirst({
      where: { id: milestoneId, deletedAt: null },
    });
    if (!milestone) throw new NotFoundException('Project Milestone not found');

    await this.prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { deletedAt: new Date() },
    });
  }

  // =========================================================================
  // PROJECT DELIVERABLES (9.6)
  // =========================================================================

  async createProjectDeliverable(
    projectId: string,
    dto: CreateProjectDeliverableDto,
  ): Promise<ProjectDeliverableResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (dto.documentId) {
      const doc = await this.prisma.document.findFirst({
        where: { id: dto.documentId, deletedAt: null },
      });
      if (!doc) throw new NotFoundException('Linked document not found');
    }

    const deliverable = await this.prisma.projectDeliverable.create({
      data: {
        deliverableUid: crypto.randomUUID(),
        projectId,
        deliverableName: dto.deliverableName,
        description: dto.description || null,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
        deliveredDate: dto.deliveredDate ? new Date(dto.deliveredDate) : null,
        status: dto.status || 'pending',
        documentId: dto.documentId || null,
      },
      include: { document: true },
    });

    return this.mapToDeliverableResponse(deliverable);
  }

  async updateProjectDeliverable(
    deliverableId: string,
    dto: UpdateProjectDeliverableDto,
  ): Promise<ProjectDeliverableResponseDto> {
    const deliverable = await this.prisma.projectDeliverable.findFirst({
      where: { id: deliverableId, deletedAt: null },
    });
    if (!deliverable) throw new NotFoundException('Project Deliverable not found');

    if (dto.documentId) {
      const doc = await this.prisma.document.findFirst({
        where: { id: dto.documentId, deletedAt: null },
      });
      if (!doc) throw new NotFoundException('Linked document not found');
    }

    const updated = await this.prisma.projectDeliverable.update({
      where: { id: deliverableId },
      data: {
        deliverableName: dto.deliverableName,
        description: dto.description,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        deliveredDate: dto.deliveredDate ? new Date(dto.deliveredDate) : undefined,
        status: dto.status,
        documentId: dto.documentId,
      },
      include: { document: true },
    });

    return this.mapToDeliverableResponse(updated);
  }

  async removeProjectDeliverable(deliverableId: string): Promise<void> {
    const deliverable = await this.prisma.projectDeliverable.findFirst({
      where: { id: deliverableId, deletedAt: null },
    });
    if (!deliverable) throw new NotFoundException('Project Deliverable not found');

    await this.prisma.projectDeliverable.update({
      where: { id: deliverableId },
      data: { deletedAt: new Date() },
    });
  }

  // =========================================================================
  // PROJECT RISKS (9.7)
  // =========================================================================

  async createProjectRisk(
    projectId: string,
    dto: CreateProjectRiskDto,
  ): Promise<ProjectRiskResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (dto.ownerId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.ownerId },
      });
      if (!user) throw new NotFoundException('Risk owner User not found');
    }

    const risk = await this.prisma.projectRisk.create({
      data: {
        riskUid: crypto.randomUUID(),
        projectId,
        riskDescription: dto.riskDescription,
        mitigationPlan: dto.mitigationPlan || null,
        likelihood: dto.likelihood || null,
        impact: dto.impact || null,
        status: dto.status || 'open',
        ownerId: dto.ownerId || null,
        identifiedDate: new Date(dto.identifiedDate),
        resolvedDate: dto.resolvedDate ? new Date(dto.resolvedDate) : null,
      },
      include: { owner: true },
    });

    return this.mapToRiskResponse(risk);
  }

  async updateProjectRisk(
    riskId: string,
    dto: UpdateProjectRiskDto,
  ): Promise<ProjectRiskResponseDto> {
    const risk = await this.prisma.projectRisk.findFirst({
      where: { id: riskId, deletedAt: null },
    });
    if (!risk) throw new NotFoundException('Project Risk not found');

    if (dto.ownerId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.ownerId },
      });
      if (!user) throw new NotFoundException('Risk owner User not found');
    }

    const updated = await this.prisma.projectRisk.update({
      where: { id: riskId },
      data: {
        riskDescription: dto.riskDescription,
        mitigationPlan: dto.mitigationPlan,
        likelihood: dto.likelihood,
        impact: dto.impact,
        status: dto.status,
        ownerId: dto.ownerId,
        identifiedDate: dto.identifiedDate ? new Date(dto.identifiedDate) : undefined,
        resolvedDate: dto.resolvedDate ? new Date(dto.resolvedDate) : undefined,
      },
      include: { owner: true },
    });

    return this.mapToRiskResponse(updated);
  }

  async removeProjectRisk(riskId: string): Promise<void> {
    const risk = await this.prisma.projectRisk.findFirst({
      where: { id: riskId, deletedAt: null },
    });
    if (!risk) throw new NotFoundException('Project Risk not found');

    await this.prisma.projectRisk.update({
      where: { id: riskId },
      data: { deletedAt: new Date() },
    });
  }

  // =========================================================================
  // RESOURCE CONTRIBUTIONS (9.8)
  // =========================================================================

  async createResourceContribution(
    collaborationId: string,
    dto: CreateResourceContributionDto,
    userId: string,
  ): Promise<ResourceContributionResponseDto> {
    // Validate collaboration
    const collab = await this.prisma.collaboration.findFirst({
      where: { id: collaborationId, deletedAt: null },
    });
    if (!collab) throw new NotFoundException('Collaboration not found');

    // Validate partner
    const partner = await this.prisma.partner.findFirst({
      where: { id: dto.partnerId, deletedAt: null },
    });
    if (!partner) throw new NotFoundException('Partner not found');

    // Validate project if provided
    if (dto.projectId) {
      const proj = await this.prisma.project.findFirst({
        where: { id: dto.projectId, deletedAt: null },
      });
      if (!proj) throw new NotFoundException('Project not found');
    }

    // Generate unique resource contribution ID: RES-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.resourceContribution.count({
      where: { resourceId: { startsWith: `RES-${year}` } },
    });
    const resourceId = `RES-${year}-${String(count + 1).padStart(4, '0')}`;

    const resource = await this.prisma.resourceContribution.create({
      data: {
        resourceUid: crypto.randomUUID(),
        resourceId,
        collaborationId,
        partnerId: dto.partnerId,
        projectId: dto.projectId || null,
        eaiiStaff: dto.eaiiStaff || null,
        eaiiInfrastructure: dto.eaiiInfrastructure || null,
        eaiiFunding: dto.eaiiFunding ? new Prisma.Decimal(dto.eaiiFunding) : null,
        eaiiEquipment: dto.eaiiEquipment || null,
        eaiiDataResources: dto.eaiiDataResources || null,
        partnerStaff: dto.partnerStaff || null,
        partnerFunding: dto.partnerFunding ? new Prisma.Decimal(dto.partnerFunding) : null,
        partnerTechnology: dto.partnerTechnology || null,
        partnerEquipment: dto.partnerEquipment || null,
        partnerExpertise: dto.partnerExpertise || null,
        estimatedMonetaryValue: dto.estimatedMonetaryValue ? new Prisma.Decimal(dto.estimatedMonetaryValue) : null,
        estimatedInKindValue: dto.estimatedInKindValue ? new Prisma.Decimal(dto.estimatedInKindValue) : null,
        currency: dto.currency || null,
        status: dto.status || 'Active',
        createdById: userId,
      },
      include: this.getResourceInclude(),
    });

    return this.mapToResourceContributionResponse(resource);
  }

  async findAllResourceContributions(
    collaborationId: string,
    query: QueryResourceContributionsDto,
  ): Promise<{
    data: ResourceContributionResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      partnerId,
      projectId,
      status,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ResourceContributionWhereInput = {
      collaborationId,
      deletedAt: null,
    };

    if (partnerId) where.partnerId = partnerId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { resourceId: { contains: search, mode: 'insensitive' } },
        { eaiiStaff: { contains: search, mode: 'insensitive' } },
        { partnerStaff: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.resourceContribution.count({ where }),
      this.prisma.resourceContribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.getResourceInclude(),
      }),
    ]);

    return {
      data: items.map((r) => this.mapToResourceContributionResponse(r)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneResourceContribution(id: string): Promise<ResourceContributionResponseDto> {
    const res = await this.prisma.resourceContribution.findFirst({
      where: { id, deletedAt: null },
      include: this.getResourceInclude(),
    });
    if (!res) throw new NotFoundException('Resource Contribution not found');
    return this.mapToResourceContributionResponse(res);
  }

  async updateResourceContribution(
    id: string,
    dto: UpdateResourceContributionDto,
  ): Promise<ResourceContributionResponseDto> {
    const res = await this.prisma.resourceContribution.findFirst({
      where: { id, deletedAt: null },
    });
    if (!res) throw new NotFoundException('Resource Contribution not found');

    if (dto.partnerId) {
      const partner = await this.prisma.partner.findFirst({
        where: { id: dto.partnerId, deletedAt: null },
      });
      if (!partner) throw new NotFoundException('Partner not found');
    }

    if (dto.projectId) {
      const proj = await this.prisma.project.findFirst({
        where: { id: dto.projectId, deletedAt: null },
      });
      if (!proj) throw new NotFoundException('Project not found');
    }

    const updated = await this.prisma.resourceContribution.update({
      where: { id },
      data: {
        partnerId: dto.partnerId,
        projectId: dto.projectId,
        eaiiStaff: dto.eaiiStaff,
        eaiiInfrastructure: dto.eaiiInfrastructure,
        eaiiFunding: dto.eaiiFunding ? new Prisma.Decimal(dto.eaiiFunding) : undefined,
        eaiiEquipment: dto.eaiiEquipment,
        eaiiDataResources: dto.eaiiDataResources,
        partnerStaff: dto.partnerStaff,
        partnerFunding: dto.partnerFunding ? new Prisma.Decimal(dto.partnerFunding) : undefined,
        partnerTechnology: dto.partnerTechnology,
        partnerEquipment: dto.partnerEquipment,
        partnerExpertise: dto.partnerExpertise,
        estimatedMonetaryValue: dto.estimatedMonetaryValue ? new Prisma.Decimal(dto.estimatedMonetaryValue) : undefined,
        estimatedInKindValue: dto.estimatedInKindValue ? new Prisma.Decimal(dto.estimatedInKindValue) : undefined,
        currency: dto.currency,
        status: dto.status,
      },
      include: this.getResourceInclude(),
    });

    return this.mapToResourceContributionResponse(updated);
  }

  async removeResourceContribution(id: string): Promise<void> {
    const res = await this.prisma.resourceContribution.findFirst({
      where: { id, deletedAt: null },
    });
    if (!res) throw new NotFoundException('Resource Contribution not found');

    await this.prisma.resourceContribution.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'Cancelled' },
    });
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  private getProjectInclude() {
    return {
      partner: { select: { id: true, partnerName: true, partnerId: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
      approvedBy: { select: { id: true, fullName: true, email: true } },
      detailedMilestones: { where: { deletedAt: null } },
      detailedDeliverables: { where: { deletedAt: null }, include: { document: { select: { id: true, documentName: true, fileName: true, filePath: true } } } },
      detailedRisks: { where: { deletedAt: null }, include: { owner: { select: { id: true, fullName: true, email: true } } } },
    };
  }

  private getResourceInclude() {
    return {
      partner: { select: { id: true, partnerName: true, partnerId: true } },
      project: { select: { id: true, projectName: true, projectId: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
    };
  }

  private mapToProjectResponse(proj: any): ProjectResponseDto {
    return {
      id: proj.id,
      projectUid: proj.projectUid,
      projectId: proj.projectId,
      collaborationId: proj.collaborationId,
      partnerId: proj.partnerId,
      partner: proj.partner,
      projectName: proj.projectName,
      description: proj.description ?? undefined,
      thematicArea: proj.thematicArea ?? undefined,
      budget: proj.budget ? proj.budget.toString() : undefined,
      fundingSource: proj.fundingSource ?? undefined,
      currency: proj.currency ?? undefined,
      projectManager: proj.projectManager ?? undefined,
      partnerLead: proj.partnerLead ?? undefined,
      teamMembers: proj.teamMembers,
      startDate: proj.startDate ?? undefined,
      endDate: proj.endDate ?? undefined,
      percentageCompletion: proj.percentageCompletion ? proj.percentageCompletion.toString() : '0.00',
      milestonesSummary: proj.milestonesSummary,
      deliverablesSummary: proj.deliverablesSummary,
      risksSummary: proj.risksSummary,
      status: proj.status,
      approvalStatus: proj.approvalStatus,
      approvalReason: proj.approvalReason ?? undefined,
      approvedBy: proj.approvedBy ?? undefined,
      approvedAt: proj.approvedAt ?? undefined,
      createdBy: proj.createdBy,
      createdAt: proj.createdAt,
      updatedAt: proj.updatedAt,
      milestones: proj.detailedMilestones ? proj.detailedMilestones.map((m: any) => this.mapToMilestoneResponse(m)) : [],
      deliverables: proj.detailedDeliverables ? proj.detailedDeliverables.map((d: any) => this.mapToDeliverableResponse(d)) : [],
      risks: proj.detailedRisks ? proj.detailedRisks.map((r: any) => this.mapToRiskResponse(r)) : [],
    };
  }

  private mapToMilestoneResponse(m: any): ProjectMilestoneResponseDto {
    return {
      id: m.id,
      milestoneUid: m.milestoneUid,
      projectId: m.projectId,
      milestoneName: m.milestoneName,
      description: m.description ?? undefined,
      dueDate: m.dueDate,
      completionDate: m.completionDate ?? undefined,
      status: m.status,
      percentageComplete: m.percentageComplete ? m.percentageComplete.toString() : '0.00',
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  private mapToDeliverableResponse(d: any): ProjectDeliverableResponseDto {
    return {
      id: d.id,
      deliverableUid: d.deliverableUid,
      projectId: d.projectId,
      deliverableName: d.deliverableName,
      description: d.description ?? undefined,
      expectedDate: d.expectedDate ?? undefined,
      deliveredDate: d.deliveredDate ?? undefined,
      status: d.status,
      document: d.document ?? undefined,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  private mapToRiskResponse(r: any): ProjectRiskResponseDto {
    return {
      id: r.id,
      riskUid: r.riskUid,
      projectId: r.projectId,
      riskDescription: r.riskDescription,
      mitigationPlan: r.mitigationPlan ?? undefined,
      likelihood: r.likelihood ?? undefined,
      impact: r.impact ?? undefined,
      status: r.status,
      owner: r.owner ?? undefined,
      identifiedDate: r.identifiedDate,
      resolvedDate: r.resolvedDate ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private mapToResourceContributionResponse(res: any): ResourceContributionResponseDto {
    return {
      id: res.id,
      resourceUid: res.resourceUid,
      resourceId: res.resourceId,
      collaborationId: res.collaborationId,
      partnerId: res.partnerId,
      partner: res.partner,
      project: res.project ?? undefined,
      eaiiStaff: res.eaiiStaff ?? undefined,
      eaiiInfrastructure: res.eaiiInfrastructure ?? undefined,
      eaiiFunding: res.eaiiFunding ? res.eaiiFunding.toString() : undefined,
      eaiiEquipment: res.eaiiEquipment ?? undefined,
      eaiiDataResources: res.eaiiDataResources ?? undefined,
      partnerStaff: res.partnerStaff ?? undefined,
      partnerFunding: res.partnerFunding ? res.partnerFunding.toString() : undefined,
      partnerTechnology: res.partnerTechnology ?? undefined,
      partnerEquipment: res.partnerEquipment ?? undefined,
      partnerExpertise: res.partnerExpertise ?? undefined,
      estimatedMonetaryValue: res.estimatedMonetaryValue ? res.estimatedMonetaryValue.toString() : undefined,
      estimatedInKindValue: res.estimatedInKindValue ? res.estimatedInKindValue.toString() : undefined,
      currency: res.currency ?? undefined,
      status: res.status,
      createdBy: res.createdBy,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
    };
  }

  // =========================================================================
  // FUNDING GRANTS (9.9)
  // =========================================================================

  async createGrant(
    collaborationId: string,
    dto: CreateFundingGrantDto,
    userId: string,
  ): Promise<FundingGrantResponseDto> {
    const collab = await this.prisma.collaboration.findFirst({
      where: { id: collaborationId, deletedAt: null },
    });
    if (!collab) throw new NotFoundException('Collaboration not found');

    const partner = await this.prisma.partner.findFirst({
      where: { id: dto.partnerId, deletedAt: null },
    });
    if (!partner) throw new NotFoundException('Partner (donor) not found');

    if (dto.projectId) {
      const proj = await this.prisma.project.findFirst({ where: { id: dto.projectId, deletedAt: null } });
      if (!proj) throw new NotFoundException('Project not found');
    }
    if (dto.resourceContributionId) {
      const res = await this.prisma.resourceContribution.findFirst({ where: { id: dto.resourceContributionId, deletedAt: null } });
      if (!res) throw new NotFoundException('Resource Contribution not found');
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.fundingGrant.count({
      where: { grantId: { startsWith: `GRT-${year}` } },
    });
    const grantId = `GRT-${year}-${String(count + 1).padStart(4, '0')}`;

    const grant = await this.prisma.fundingGrant.create({
      data: {
        grantUid: crypto.randomUUID(),
        grantId,
        collaborationId,
        partnerId: dto.partnerId,
        projectId: dto.projectId || null,
        resourceContributionId: dto.resourceContributionId || null,
        donorName: dto.donorName,
        amount: new Prisma.Decimal(dto.amount),
        currency: dto.currency,
        submissionDate: dto.submissionDate ? new Date(dto.submissionDate) : null,
        approvalDate: dto.approvalDate ? new Date(dto.approvalDate) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status || 'Concept',
        grantReferenceNumber: dto.grantReferenceNumber || null,
        description: dto.description || null,
        disbursementSchedule: dto.disbursementSchedule ? (dto.disbursementSchedule as any) : null,
        createdById: userId,
      },
      include: this.getGrantInclude(),
    });

    return this.mapToGrantResponse(grant);
  }

  async findAllGrants(
    collaborationId: string,
    query: QueryFundingGrantsDto,
  ): Promise<{
    data: FundingGrantResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 10, search, partnerId, projectId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FundingGrantWhereInput = {
      collaborationId,
      deletedAt: null,
    };
    if (partnerId) where.partnerId = partnerId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { grantId: { contains: search, mode: 'insensitive' } },
        { donorName: { contains: search, mode: 'insensitive' } },
        { grantReferenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.fundingGrant.count({ where }),
      this.prisma.fundingGrant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.getGrantInclude(),
      }),
    ]);

    return {
      data: items.map((g) => this.mapToGrantResponse(g)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneGrant(id: string): Promise<FundingGrantResponseDto> {
    const grant = await this.prisma.fundingGrant.findFirst({
      where: { id, deletedAt: null },
      include: this.getGrantInclude(),
    });
    if (!grant) throw new NotFoundException('Funding Grant not found');
    return this.mapToGrantResponse(grant);
  }

  async updateGrant(
    id: string,
    dto: UpdateFundingGrantDto,
  ): Promise<FundingGrantResponseDto> {
    const grant = await this.prisma.fundingGrant.findFirst({ where: { id, deletedAt: null } });
    if (!grant) throw new NotFoundException('Funding Grant not found');

    if (dto.partnerId) {
      const partner = await this.prisma.partner.findFirst({ where: { id: dto.partnerId, deletedAt: null } });
      if (!partner) throw new NotFoundException('Partner not found');
    }

    const updated = await this.prisma.fundingGrant.update({
      where: { id },
      data: {
        partnerId: dto.partnerId,
        projectId: dto.projectId,
        resourceContributionId: dto.resourceContributionId,
        donorName: dto.donorName,
        amount: dto.amount ? new Prisma.Decimal(dto.amount) : undefined,
        currency: dto.currency,
        submissionDate: dto.submissionDate ? new Date(dto.submissionDate) : undefined,
        approvalDate: dto.approvalDate ? new Date(dto.approvalDate) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
        grantReferenceNumber: dto.grantReferenceNumber,
        description: dto.description,
        disbursementSchedule: dto.disbursementSchedule ? (dto.disbursementSchedule as any) : undefined,
      },
      include: this.getGrantInclude(),
    });

    return this.mapToGrantResponse(updated);
  }

  async removeGrant(id: string): Promise<void> {
    const grant = await this.prisma.fundingGrant.findFirst({ where: { id, deletedAt: null } });
    if (!grant) throw new NotFoundException('Funding Grant not found');
    await this.prisma.fundingGrant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // =========================================================================
  // GRANT DISBURSEMENTS (9.10)
  // =========================================================================

  async createDisbursement(
    grantId: string,
    dto: CreateGrantDisbursementDto,
  ): Promise<GrantDisbursementResponseDto> {
    const grant = await this.prisma.fundingGrant.findFirst({ where: { id: grantId, deletedAt: null } });
    if (!grant) throw new NotFoundException('Funding Grant not found');

    const disb = await this.prisma.grantDisbursement.create({
      data: {
        disbursementUid: crypto.randomUUID(),
        grantId,
        disbursementDate: new Date(dto.disbursementDate),
        amount: new Prisma.Decimal(dto.amount),
        currency: dto.currency,
        description: dto.description || null,
        referenceNumber: dto.referenceNumber || null,
        status: dto.status || 'pending',
      },
    });

    return this.mapToDisbursementResponse(disb);
  }

  async updateDisbursement(
    id: string,
    dto: UpdateGrantDisbursementDto,
  ): Promise<GrantDisbursementResponseDto> {
    const disb = await this.prisma.grantDisbursement.findFirst({ where: { id, deletedAt: null } });
    if (!disb) throw new NotFoundException('Grant Disbursement not found');

    const updated = await this.prisma.grantDisbursement.update({
      where: { id },
      data: {
        disbursementDate: dto.disbursementDate ? new Date(dto.disbursementDate) : undefined,
        amount: dto.amount ? new Prisma.Decimal(dto.amount) : undefined,
        currency: dto.currency,
        description: dto.description,
        referenceNumber: dto.referenceNumber,
        status: dto.status,
      },
    });

    return this.mapToDisbursementResponse(updated);
  }

  async removeDisbursement(id: string): Promise<void> {
    const disb = await this.prisma.grantDisbursement.findFirst({ where: { id, deletedAt: null } });
    if (!disb) throw new NotFoundException('Grant Disbursement not found');
    await this.prisma.grantDisbursement.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'cancelled' },
    });
  }

  // =========================================================================
  // COLLABORATION DOCUMENTS (9.11)
  // =========================================================================

  async createCollaborationDocument(
    dto: CreateCollaborationDocumentDto,
  ): Promise<CollaborationDocumentResponseDto> {
    const doc = await this.prisma.document.findFirst({
      where: { id: dto.documentId, deletedAt: null },
    });
    if (!doc) throw new NotFoundException('Document not found');

    // Check uniqueness
    const existing = await this.prisma.collaborationDocument.findFirst({
      where: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        documentId: dto.documentId,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException('Document is already linked to this entity');
    }

    const collabDoc = await this.prisma.collaborationDocument.create({
      data: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        documentId: dto.documentId,
        documentCategory: dto.documentCategory,
        isCurrent: dto.isCurrent ?? true,
      },
      include: {
        document: {
          select: {
            id: true,
            documentName: true,
            fileName: true,
            filePath: true,
            fileFormat: true,
          },
        },
      },
    });

    return this.mapToCollaborationDocumentResponse(collabDoc);
  }

  async findCollaborationDocuments(
    entityType: string,
    entityId: string,
  ): Promise<CollaborationDocumentResponseDto[]> {
    const docs = await this.prisma.collaborationDocument.findMany({
      where: { entityType, entityId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        document: {
          select: {
            id: true,
            documentName: true,
            fileName: true,
            filePath: true,
            fileFormat: true,
          },
        },
      },
    });
    return docs.map((d) => this.mapToCollaborationDocumentResponse(d));
  }

  async updateCollaborationDocument(
    id: string,
    dto: UpdateCollaborationDocumentDto,
  ): Promise<CollaborationDocumentResponseDto> {
    const collabDoc = await this.prisma.collaborationDocument.findFirst({
      where: { id, deletedAt: null },
    });
    if (!collabDoc) throw new NotFoundException('Collaboration Document link not found');

    const updated = await this.prisma.collaborationDocument.update({
      where: { id },
      data: {
        documentCategory: dto.documentCategory,
        isCurrent: dto.isCurrent,
      },
      include: {
        document: {
          select: {
            id: true,
            documentName: true,
            fileName: true,
            filePath: true,
            fileFormat: true,
          },
        },
      },
    });
    return this.mapToCollaborationDocumentResponse(updated);
  }

  async removeCollaborationDocument(id: string): Promise<void> {
    const collabDoc = await this.prisma.collaborationDocument.findFirst({
      where: { id, deletedAt: null },
    });
    if (!collabDoc) throw new NotFoundException('Collaboration Document link not found');
    await this.prisma.collaborationDocument.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // =========================================================================
  // APPROVAL HISTORY (9.12)
  // =========================================================================

  async logApprovalAction(
    entityType: string,
    entityId: string,
    action: string,
    userId: string,
    notes?: string,
    reason?: string,
  ): Promise<void> {
    await this.prisma.activityApprovalHistory.create({
      data: {
        entityType,
        entityId,
        action,
        actionById: userId,
        actionDate: new Date(),
        notes: notes || null,
        reason: reason || null,
      },
    });
  }

  async getApprovalHistory(
    entityType: string,
    entityId: string,
  ): Promise<ApprovalHistoryResponseDto[]> {
    const logs = await this.prisma.activityApprovalHistory.findMany({
      where: { entityType, entityId },
      orderBy: { actionDate: 'desc' },
      include: {
        actionBy: { select: { id: true, fullName: true, email: true } },
      },
    });
    return logs.map((l) => this.mapToApprovalHistoryResponse(l));
  }

  // ─── PHASE 3 HELPERS ─────────────────────────────────────────────

  private getGrantInclude() {
    return {
      partner: { select: { id: true, partnerName: true, partnerId: true } },
      project: { select: { id: true, projectName: true, projectId: true } },
      resourceContribution: { select: { id: true, resourceId: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
      disbursements: { where: { deletedAt: null } },
    };
  }

  private mapToGrantResponse(g: any): FundingGrantResponseDto {
    return {
      id: g.id,
      grantUid: g.grantUid,
      grantId: g.grantId,
      collaborationId: g.collaborationId,
      partnerId: g.partnerId,
      partner: g.partner,
      project: g.project ?? undefined,
      resourceContribution: g.resourceContribution ?? undefined,
      donorName: g.donorName,
      amount: g.amount.toString(),
      currency: g.currency,
      submissionDate: g.submissionDate ?? undefined,
      approvalDate: g.approvalDate ?? undefined,
      startDate: g.startDate ?? undefined,
      endDate: g.endDate ?? undefined,
      status: g.status,
      grantReferenceNumber: g.grantReferenceNumber ?? undefined,
      description: g.description ?? undefined,
      disbursementSchedule: g.disbursementSchedule,
      createdBy: g.createdBy,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      disbursements: g.disbursements
        ? g.disbursements.map((d: any) => this.mapToDisbursementResponse(d))
        : [],
    };
  }

  private mapToDisbursementResponse(d: any): GrantDisbursementResponseDto {
    return {
      id: d.id,
      disbursementUid: d.disbursementUid,
      grantId: d.grantId,
      disbursementDate: d.disbursementDate,
      amount: d.amount.toString(),
      currency: d.currency,
      description: d.description ?? undefined,
      referenceNumber: d.referenceNumber ?? undefined,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  private mapToCollaborationDocumentResponse(d: any): CollaborationDocumentResponseDto {
    return {
      id: d.id,
      entityType: d.entityType,
      entityId: d.entityId,
      documentId: d.documentId,
      document: d.document,
      documentCategory: d.documentCategory,
      isCurrent: d.isCurrent,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  private mapToApprovalHistoryResponse(l: any): ApprovalHistoryResponseDto {
    return {
      id: l.id,
      entityType: l.entityType,
      entityId: l.entityId,
      action: l.action,
      actionBy: l.actionBy,
      actionDate: l.actionDate,
      notes: l.notes ?? undefined,
      reason: l.reason ?? undefined,
      createdAt: l.createdAt,
    };
  }
}

