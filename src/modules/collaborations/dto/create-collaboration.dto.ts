// src/modules/collaborations/dto/create-collaboration.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum CollaborationType {
  JOINT_ACTIVITY = 'Joint Activity',
  PROJECT = 'Project',
  RESOURCE_CONTRIBUTION = 'Resource Contribution',
  FUNDING_AND_GRANT = 'Funding and Grant',
}

export enum CollaborationStatus {
  PLANNED = 'Planned',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  DELAYED = 'Delayed',
  CANCELLED = 'Cancelled',
}

export class CreateCollaborationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Partner UUID' })
  @IsUUID(4)
  partnerId: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000', description: 'Agreement UUID (optional)' })
  @IsOptional()
  @IsUUID(4)
  agreementId?: string;

  @ApiProperty({ example: 'AI Research Collaboration with UNDP' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ required: false, example: 'Joint research on AI-driven crop forecasting.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CollaborationType, example: CollaborationType.JOINT_ACTIVITY })
  @IsEnum(CollaborationType)
  collaborationType: CollaborationType;

  @ApiProperty({ required: false, example: '2026-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: CollaborationStatus, default: CollaborationStatus.PLANNED })
  @IsOptional()
  @IsEnum(CollaborationStatus)
  status?: CollaborationStatus = CollaborationStatus.PLANNED;
}
