// src/modules/collaborations/collaborations.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CollaborationsService } from './collaborations.service';
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

// Phase 2 DTO imports
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

// Phase 3 DTO imports
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Collaborations')
@ApiBearerAuth()
@Controller('collaborations')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  // =========================================================================
  // COLLABORATIONS
  // =========================================================================

  @Post()
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create a new collaboration' })
  @ApiResponse({ status: 201, type: CollaborationResponseDto })
  create(
    @Body() dto: CreateCollaborationDto,
    @CurrentUser('id') userId: string,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.createCollaboration(dto, userId);
  }

  @Get()
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all collaborations (paginated & filtered)' })
  findAll(@Query() query: QueryCollaborationsDto) {
    return this.collaborationsService.findAllCollaborations(query);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get collaboration by UUID' })
  @ApiResponse({ status: 200, type: CollaborationResponseDto })
  findOne(@Param('id') id: string): Promise<CollaborationResponseDto> {
    return this.collaborationsService.findOneCollaboration(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update collaboration' })
  @ApiResponse({ status: 200, type: CollaborationResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCollaborationDto,
    @CurrentUser('id') userId: string,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.updateCollaboration(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Soft delete a collaboration' })
  remove(@Param('id') id: string): Promise<void> {
    return this.collaborationsService.removeCollaboration(id);
  }

  // =========================================================================
  // JOINT ACTIVITIES
  // =========================================================================

  @Post(':id/activities')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create a joint activity under a collaboration' })
  @ApiResponse({ status: 201, type: JointActivityResponseDto })
  createActivity(
    @Param('id') collaborationId: string,
    @Body() dto: CreateJointActivityDto,
    @CurrentUser('id') userId: string,
  ): Promise<JointActivityResponseDto> {
    return this.collaborationsService.createActivity(collaborationId, dto, userId);
  }

  @Get(':id/activities')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'List joint activities under a collaboration' })
  findAllActivities(
    @Param('id') collaborationId: string,
    @Query() query: any,
  ) {
    return this.collaborationsService.findAllActivities(collaborationId, query);
  }

  @Get(':id/activities/:actId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get joint activity details' })
  @ApiResponse({ status: 200, type: JointActivityResponseDto })
  findOneActivity(@Param('actId') actId: string): Promise<JointActivityResponseDto> {
    return this.collaborationsService.findOneActivity(actId);
  }

  @Patch(':id/activities/:actId')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update joint activity info' })
  @ApiResponse({ status: 200, type: JointActivityResponseDto })
  updateActivity(
    @Param('actId') actId: string,
    @Body() dto: UpdateJointActivityDto,
    @CurrentUser('id') userId: string,
  ): Promise<JointActivityResponseDto> {
    return this.collaborationsService.updateActivity(actId, dto, userId);
  }

  @Delete(':id/activities/:actId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Soft delete joint activity' })
  removeActivity(@Param('actId') actId: string): Promise<void> {
    return this.collaborationsService.removeActivity(actId);
  }

  // ─── Workflow steps ──────────────────────────────────────────────

  @Patch(':id/activities/:actId/review')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Review/Evaluate joint activity' })
  @ApiResponse({ status: 200, type: JointActivityResponseDto })
  reviewActivity(
    @Param('actId') actId: string,
    @Body() dto: ReviewJointActivityDto,
    @CurrentUser('id') userId: string,
  ): Promise<JointActivityResponseDto> {
    return this.collaborationsService.reviewActivity(actId, dto, userId);
  }

  @Patch(':id/activities/:actId/verify')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Verify joint activity' })
  @ApiResponse({ status: 200, type: JointActivityResponseDto })
  verifyActivity(
    @Param('actId') actId: string,
    @Body() dto: ReviewJointActivityDto,
    @CurrentUser('id') userId: string,
  ): Promise<JointActivityResponseDto> {
    return this.collaborationsService.verifyActivity(actId, dto, userId);
  }

  @Patch(':id/activities/:actId/approve')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Approve or reject joint activity (Director General)' })
  @ApiResponse({ status: 200, type: JointActivityResponseDto })
  approveActivity(
    @Param('actId') actId: string,
    @Body() dto: ApproveJointActivityDto,
    @CurrentUser('id') userId: string,
  ): Promise<JointActivityResponseDto> {
    return this.collaborationsService.approveActivity(actId, dto, userId);
  }

  // =========================================================================
  // ACTIVITY OUTPUTS (Flat routing structure for detail editing)
  // =========================================================================

  @Post('activities/:actId/outputs')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Add a planned/actual output to an activity' })
  @ApiResponse({ status: 201, type: ActivityOutputResponseDto })
  createOutput(
    @Param('actId') activityId: string,
    @Body() dto: CreateActivityOutputDto,
  ): Promise<ActivityOutputResponseDto> {
    return this.collaborationsService.createOutput(activityId, dto);
  }

  @Get('activities/:actId/outputs')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get outputs list for an activity' })
  @ApiResponse({ status: 200, type: [ActivityOutputResponseDto] })
  findOutputs(@Param('actId') activityId: string): Promise<ActivityOutputResponseDto[]> {
    return this.collaborationsService.findOutputs(activityId);
  }

  @Patch('activities/outputs/:outputId')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update activity output detail' })
  @ApiResponse({ status: 200, type: ActivityOutputResponseDto })
  updateOutput(
    @Param('outputId') outputId: string,
    @Body() dto: UpdateActivityOutputDto,
  ): Promise<ActivityOutputResponseDto> {
    return this.collaborationsService.updateOutput(outputId, dto);
  }

  @Delete('activities/outputs/:outputId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete activity output detail' })
  removeOutput(@Param('outputId') outputId: string): Promise<void> {
    return this.collaborationsService.removeOutput(outputId);
  }

  // =========================================================================
  // PROJECTS (9.4)
  // =========================================================================

  @Post(':id/projects')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create a project under a collaboration' })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  createProject(
    @Param('id') collaborationId: string,
    @Body() dto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProjectResponseDto> {
    return this.collaborationsService.createProject(collaborationId, dto, userId);
  }

  @Get(':id/projects')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'List projects under a collaboration' })
  findAllProjects(
    @Param('id') collaborationId: string,
    @Query() query: QueryProjectsDto,
  ) {
    return this.collaborationsService.findAllProjects(collaborationId, query);
  }

  @Get('projects/:projectId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get project details' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  findOneProject(@Param('projectId') projectId: string): Promise<ProjectResponseDto> {
    return this.collaborationsService.findOneProject(projectId);
  }

  @Patch('projects/:projectId')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update project info' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  updateProject(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.collaborationsService.updateProject(projectId, dto);
  }

  @Delete('projects/:projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Soft delete project' })
  removeProject(@Param('projectId') projectId: string): Promise<void> {
    return this.collaborationsService.removeProject(projectId);
  }

  @Patch('projects/:projectId/approve')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Approve project (Director General)' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  approveProject(
    @Param('projectId') projectId: string,
    @Body() dto: ApproveProjectDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProjectResponseDto> {
    return this.collaborationsService.approveProject(projectId, dto, userId);
  }

  // =========================================================================
  // PROJECT MILESTONES (9.5)
  // =========================================================================

  @Post('projects/:projectId/milestones')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create project milestone' })
  @ApiResponse({ status: 201, type: ProjectMilestoneResponseDto })
  createMilestone(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectMilestoneDto,
  ): Promise<ProjectMilestoneResponseDto> {
    return this.collaborationsService.createProjectMilestone(projectId, dto);
  }

  @Patch('projects/milestones/:id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update project milestone' })
  @ApiResponse({ status: 200, type: ProjectMilestoneResponseDto })
  updateMilestone(
    @Param('id') id: string,
    @Body() dto: UpdateProjectMilestoneDto,
  ): Promise<ProjectMilestoneResponseDto> {
    return this.collaborationsService.updateProjectMilestone(id, dto);
  }

  @Delete('projects/milestones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete project milestone' })
  removeMilestone(@Param('id') id: string): Promise<void> {
    return this.collaborationsService.removeProjectMilestone(id);
  }

  // =========================================================================
  // PROJECT DELIVERABLES (9.6)
  // =========================================================================

  @Post('projects/:projectId/deliverables')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create project deliverable' })
  @ApiResponse({ status: 201, type: ProjectDeliverableResponseDto })
  createDeliverable(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectDeliverableDto,
  ): Promise<ProjectDeliverableResponseDto> {
    return this.collaborationsService.createProjectDeliverable(projectId, dto);
  }

  @Patch('projects/deliverables/:id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update project deliverable' })
  @ApiResponse({ status: 200, type: ProjectDeliverableResponseDto })
  updateDeliverable(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDeliverableDto,
  ): Promise<ProjectDeliverableResponseDto> {
    return this.collaborationsService.updateProjectDeliverable(id, dto);
  }

  @Delete('projects/deliverables/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete project deliverable' })
  removeDeliverable(@Param('id') id: string): Promise<void> {
    return this.collaborationsService.removeProjectDeliverable(id);
  }

  // =========================================================================
  // PROJECT RISKS (9.7)
  // =========================================================================

  @Post('projects/:projectId/risks')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create project risk' })
  @ApiResponse({ status: 201, type: ProjectRiskResponseDto })
  createRisk(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectRiskDto,
  ): Promise<ProjectRiskResponseDto> {
    return this.collaborationsService.createProjectRisk(projectId, dto);
  }

  @Patch('projects/risks/:id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update project risk' })
  @ApiResponse({ status: 200, type: ProjectRiskResponseDto })
  updateRisk(
    @Param('id') id: string,
    @Body() dto: UpdateProjectRiskDto,
  ): Promise<ProjectRiskResponseDto> {
    return this.collaborationsService.updateProjectRisk(id, dto);
  }

  @Delete('projects/risks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete project risk' })
  removeRisk(@Param('id') id: string): Promise<void> {
    return this.collaborationsService.removeProjectRisk(id);
  }

  // =========================================================================
  // RESOURCE CONTRIBUTIONS (9.8)
  // =========================================================================

  @Post(':id/resources')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Register a resource contribution under a collaboration' })
  @ApiResponse({ status: 201, type: ResourceContributionResponseDto })
  createResource(
    @Param('id') collaborationId: string,
    @Body() dto: CreateResourceContributionDto,
    @CurrentUser('id') userId: string,
  ): Promise<ResourceContributionResponseDto> {
    return this.collaborationsService.createResourceContribution(collaborationId, dto, userId);
  }

  @Get(':id/resources')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'List resource contributions under a collaboration' })
  findAllResources(
    @Param('id') collaborationId: string,
    @Query() query: QueryResourceContributionsDto,
  ) {
    return this.collaborationsService.findAllResourceContributions(collaborationId, query);
  }

  @Get('resources/:resourceId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get resource contribution details' })
  @ApiResponse({ status: 200, type: ResourceContributionResponseDto })
  findOneResource(@Param('resourceId') resourceId: string): Promise<ResourceContributionResponseDto> {
    return this.collaborationsService.findOneResourceContribution(resourceId);
  }

  @Patch('resources/:resourceId')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update resource contribution details' })
  @ApiResponse({ status: 200, type: ResourceContributionResponseDto })
  updateResource(
    @Param('resourceId') resourceId: string,
    @Body() dto: UpdateResourceContributionDto,
  ): Promise<ResourceContributionResponseDto> {
    return this.collaborationsService.updateResourceContribution(resourceId, dto);
  }

  @Delete('resources/:resourceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Remove resource contribution' })
  removeResource(@Param('resourceId') resourceId: string): Promise<void> {
    return this.collaborationsService.removeResourceContribution(resourceId);
  }

  // =========================================================================
  // FUNDING GRANTS (9.9)
  // =========================================================================

  @Post(':id/grants')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Register a funding grant under a collaboration' })
  @ApiResponse({ status: 201, type: FundingGrantResponseDto })
  createGrant(
    @Param('id') collaborationId: string,
    @Body() dto: CreateFundingGrantDto,
    @CurrentUser('id') userId: string,
  ): Promise<FundingGrantResponseDto> {
    return this.collaborationsService.createGrant(collaborationId, dto, userId);
  }

  @Get(':id/grants')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'List grants under a collaboration' })
  findAllGrants(
    @Param('id') collaborationId: string,
    @Query() query: QueryFundingGrantsDto,
  ) {
    return this.collaborationsService.findAllGrants(collaborationId, query);
  }

  @Get('grants/:grantId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get a funding grant details' })
  @ApiResponse({ status: 200, type: FundingGrantResponseDto })
  findOneGrant(@Param('grantId') grantId: string): Promise<FundingGrantResponseDto> {
    return this.collaborationsService.findOneGrant(grantId);
  }

  @Patch('grants/:grantId')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update grant details' })
  @ApiResponse({ status: 200, type: FundingGrantResponseDto })
  updateGrant(
    @Param('grantId') grantId: string,
    @Body() dto: UpdateFundingGrantDto,
  ): Promise<FundingGrantResponseDto> {
    return this.collaborationsService.updateGrant(grantId, dto);
  }

  @Delete('grants/:grantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Soft delete a funding grant' })
  removeGrant(@Param('grantId') grantId: string): Promise<void> {
    return this.collaborationsService.removeGrant(grantId);
  }

  // =========================================================================
  // GRANT DISBURSEMENTS (9.10)
  // =========================================================================

  @Post('grants/:grantId/disbursements')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Record a disbursement for a grant' })
  @ApiResponse({ status: 201, type: GrantDisbursementResponseDto })
  createDisbursement(
    @Param('grantId') grantId: string,
    @Body() dto: CreateGrantDisbursementDto,
  ): Promise<GrantDisbursementResponseDto> {
    return this.collaborationsService.createDisbursement(grantId, dto);
  }

  @Patch('grants/disbursements/:id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update a grant disbursement' })
  @ApiResponse({ status: 200, type: GrantDisbursementResponseDto })
  updateDisbursement(
    @Param('id') id: string,
    @Body() dto: UpdateGrantDisbursementDto,
  ): Promise<GrantDisbursementResponseDto> {
    return this.collaborationsService.updateDisbursement(id, dto);
  }

  @Delete('grants/disbursements/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Remove a grant disbursement' })
  removeDisbursement(@Param('id') id: string): Promise<void> {
    return this.collaborationsService.removeDisbursement(id);
  }

  // =========================================================================
  // COLLABORATION DOCUMENTS (9.11)
  // =========================================================================

  @Post('documents')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Link a document to an entity (activity, project, resource, grant)' })
  @ApiResponse({ status: 201, type: CollaborationDocumentResponseDto })
  createCollaborationDocument(
    @Body() dto: CreateCollaborationDocumentDto,
  ): Promise<CollaborationDocumentResponseDto> {
    return this.collaborationsService.createCollaborationDocument(dto);
  }

  @Get('documents/:entityType/:entityId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'List documents linked to an entity' })
  @ApiResponse({ status: 200, type: [CollaborationDocumentResponseDto] })
  findCollaborationDocuments(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<CollaborationDocumentResponseDto[]> {
    return this.collaborationsService.findCollaborationDocuments(entityType, entityId);
  }

  @Patch('documents/:id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update document link metadata' })
  @ApiResponse({ status: 200, type: CollaborationDocumentResponseDto })
  updateCollaborationDocument(
    @Param('id') id: string,
    @Body() dto: UpdateCollaborationDocumentDto,
  ): Promise<CollaborationDocumentResponseDto> {
    return this.collaborationsService.updateCollaborationDocument(id, dto);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Unlink a document from an entity' })
  removeCollaborationDocument(@Param('id') id: string): Promise<void> {
    return this.collaborationsService.removeCollaborationDocument(id);
  }

  // =========================================================================
  // APPROVAL HISTORY (9.12)
  // =========================================================================

  @Get('approval-history/:entityType/:entityId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get approval/workflow audit log for an activity or project' })
  @ApiResponse({ status: 200, type: [ApprovalHistoryResponseDto] })
  getApprovalHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<ApprovalHistoryResponseDto[]> {
    return this.collaborationsService.getApprovalHistory(entityType, entityId);
  }
}
