// src/modules/collaborations/dto/project-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProjectPartnerDto {
  @ApiProperty() id: string;
  @ApiProperty() partnerName: string;
  @ApiProperty() partnerId: string;
}

export class ProjectUserDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() email: string;
}

export class ProjectDocumentDto {
  @ApiProperty() id: string;
  @ApiProperty() documentName: string;
  @ApiProperty() fileName: string;
  @ApiProperty() filePath: string;
}

export class ProjectMilestoneResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() milestoneUid: string;
  @ApiProperty() projectId: string;
  @ApiProperty() milestoneName: string;
  @ApiProperty({ nullable: true }) description?: string;
  @ApiProperty() dueDate: Date;
  @ApiProperty({ nullable: true }) completionDate?: Date;
  @ApiProperty() status: string;
  @ApiProperty() percentageComplete: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class ProjectDeliverableResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() deliverableUid: string;
  @ApiProperty() projectId: string;
  @ApiProperty() deliverableName: string;
  @ApiProperty({ nullable: true }) description?: string;
  @ApiProperty({ nullable: true }) expectedDate?: Date;
  @ApiProperty({ nullable: true }) deliveredDate?: Date;
  @ApiProperty() status: string;
  @ApiProperty({ nullable: true, type: () => ProjectDocumentDto }) document?: ProjectDocumentDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class ProjectRiskResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() riskUid: string;
  @ApiProperty() projectId: string;
  @ApiProperty() riskDescription: string;
  @ApiProperty({ nullable: true }) mitigationPlan?: string;
  @ApiProperty({ nullable: true }) likelihood?: string;
  @ApiProperty({ nullable: true }) impact?: string;
  @ApiProperty() status: string;
  @ApiProperty({ nullable: true, type: () => ProjectUserDto }) owner?: ProjectUserDto;
  @ApiProperty() identifiedDate: Date;
  @ApiProperty({ nullable: true }) resolvedDate?: Date;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class ProjectResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() projectUid: string;
  @ApiProperty() projectId: string;
  @ApiProperty() collaborationId: string;
  @ApiProperty() partnerId: string;
  @ApiProperty({ type: () => ProjectPartnerDto }) partner: ProjectPartnerDto;
  @ApiProperty() projectName: string;
  @ApiProperty({ nullable: true }) description?: string;
  @ApiProperty({ nullable: true }) thematicArea?: string;
  @ApiProperty({ nullable: true, type: String }) budget?: string;
  @ApiProperty({ nullable: true }) fundingSource?: string;
  @ApiProperty({ nullable: true }) currency?: string;
  @ApiProperty({ nullable: true }) projectManager?: string;
  @ApiProperty({ nullable: true }) partnerLead?: string;
  @ApiProperty({ nullable: true }) teamMembers?: any;
  @ApiProperty({ nullable: true }) startDate?: Date;
  @ApiProperty({ nullable: true }) endDate?: Date;
  @ApiProperty({ type: String }) percentageCompletion: string;
  @ApiProperty({ nullable: true }) milestonesSummary?: any;
  @ApiProperty({ nullable: true }) deliverablesSummary?: any;
  @ApiProperty({ nullable: true }) risksSummary?: any;
  @ApiProperty() status: string;
  @ApiProperty() approvalStatus: string;
  @ApiProperty({ nullable: true }) approvalReason?: string;
  @ApiProperty({ type: () => ProjectUserDto, nullable: true }) approvedBy?: ProjectUserDto;
  @ApiProperty({ nullable: true }) approvedAt?: Date;
  @ApiProperty({ type: () => ProjectUserDto }) createdBy: ProjectUserDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [ProjectMilestoneResponseDto] }) milestones?: ProjectMilestoneResponseDto[];
  @ApiProperty({ type: [ProjectDeliverableResponseDto] }) deliverables?: ProjectDeliverableResponseDto[];
  @ApiProperty({ type: [ProjectRiskResponseDto] }) risks?: ProjectRiskResponseDto[];
}
