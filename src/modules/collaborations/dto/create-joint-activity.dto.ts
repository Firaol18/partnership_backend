// src/modules/collaborations/dto/create-joint-activity.dto.ts
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

export enum ActivityType {
  RESEARCH = 'Research',
  TRAINING = 'Training',
  WORKSHOP = 'Workshop',
  CONFERENCE = 'Conference',
  FIELD_WORK = 'Field Work',
  DATA_COLLECTION = 'Data Collection',
  ANALYSIS = 'Analysis',
  PUBLICATION = 'Publication',
  OTHER = 'Other',
}

export enum ActivityStatus {
  PLANNED = 'Planned',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  DELAYED = 'Delayed',
  CANCELLED = 'Cancelled',
}

export class CreateJointActivityDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Partner UUID' })
  @IsUUID(4)
  partnerId: string;

  @ApiProperty({ example: 'Joint Research on NLP models' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  activityName: string;

  @ApiProperty({ enum: ActivityType, example: ActivityType.RESEARCH })
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @ApiProperty({ required: false, example: 'Description of the NLP research activity.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: '2026-02-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2026-08-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Lead Partner Organization UUID' })
  @IsUUID(4)
  leadOrganizationId: string;

  @ApiProperty({ example: 'AI Research Directorate' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  eaiiResponsibleUnit: string;

  @ApiProperty({ required: false, example: 'Department of Computer Science' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  partnerResponsibleUnit?: string;

  @ApiProperty({ required: false, example: ['Dataset of 10k Amharic sentences', 'NLP publication drafts'] })
  @IsOptional()
  plannedOutputs?: any;

  @ApiProperty({ required: false, example: ['Dataset of 8k sentences collected'] })
  @IsOptional()
  actualOutputs?: any;

  @ApiProperty({ enum: ActivityStatus, default: ActivityStatus.PLANNED })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus = ActivityStatus.PLANNED;
}
