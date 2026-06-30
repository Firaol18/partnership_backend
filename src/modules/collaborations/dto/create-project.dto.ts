// src/modules/collaborations/dto/create-project.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProjectThematicArea {
  AI_RESEARCH = 'AI Research',
  AI_INFRASTRUCTURE = 'AI Infrastructure',
  AI_CAPACITY_BUILDING = 'AI Capacity Building',
  STARTUP_ECOSYSTEM = 'Startup Ecosystem',
  DIGITAL_TRANSFORMATION = 'Digital Transformation',
  AI_GOVERNANCE = 'AI Governance',
  DATA_SCIENCE = 'Data Science',
  INNOVATION = 'Innovation',
  OTHER = 'Other',
}

export enum ProjectStatus {
  PLANNED = 'Planned',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  DELAYED = 'Delayed',
  CANCELLED = 'Cancelled',
}

export class ProjectTeamMemberDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Lead Developer' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'EAII' })
  @IsString()
  organization: string;
}

export class ProjectMilestoneSummaryDto {
  @ApiProperty({ example: 'Requirements Gathering' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  due_date: string;

  @ApiProperty({ example: 'pending' })
  @IsString()
  status: string;
}

export class ProjectDeliverableSummaryDto {
  @ApiProperty({ example: 'Project Proposal Doc' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Initial draft of project goals.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'pending' })
  @IsString()
  status: string;
}

export class ProjectRiskSummaryDto {
  @ApiProperty({ example: 'Delays in infrastructure acquisition.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Mitigate by early sourcing.' })
  @IsString()
  mitigation: string;

  @ApiProperty({ example: 'open' })
  @IsString()
  status: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Partner UUID' })
  @IsUUID(4)
  partnerId: string;

  @ApiProperty({ example: 'AI for Healthcare Diagnostic Project' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  projectName: string;

  @ApiProperty({ required: false, example: 'Research and development of diagnostic algorithms.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: ProjectThematicArea, example: ProjectThematicArea.AI_RESEARCH })
  @IsOptional()
  @IsEnum(ProjectThematicArea)
  thematicArea?: ProjectThematicArea;

  @ApiProperty({ required: false, example: 100000.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiProperty({ required: false, example: 'EAII & UNDP Joint Funding' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fundingSource?: string;

  @ApiProperty({ required: false, example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ required: false, example: 'Dr. Jane Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectManager?: string;

  @ApiProperty({ required: false, example: 'Prof. Alistair Cook' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  partnerLead?: string;

  @ApiProperty({ required: false, type: [ProjectTeamMemberDto] })
  @IsOptional()
  @IsArray()
  @Type(() => ProjectTeamMemberDto)
  teamMembers?: ProjectTeamMemberDto[];

  @ApiProperty({ required: false, example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2026-11-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, example: 0.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percentageCompletion?: number = 0.00;

  @ApiProperty({ required: false, type: [ProjectMilestoneSummaryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => ProjectMilestoneSummaryDto)
  milestonesSummary?: ProjectMilestoneSummaryDto[];

  @ApiProperty({ required: false, type: [ProjectDeliverableSummaryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => ProjectDeliverableSummaryDto)
  deliverablesSummary?: ProjectDeliverableSummaryDto[];

  @ApiProperty({ required: false, type: [ProjectRiskSummaryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => ProjectRiskSummaryDto)
  risksSummary?: ProjectRiskSummaryDto[];

  @ApiProperty({ enum: ProjectStatus, default: ProjectStatus.PLANNED })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus = ProjectStatus.PLANNED;
}
