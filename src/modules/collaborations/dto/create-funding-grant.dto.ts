// src/modules/collaborations/dto/create-funding-grant.dto.ts
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
} from 'class-validator';
import { Type } from 'class-transformer';

export enum GrantStatus {
  CONCEPT = 'Concept',
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
  DISBURSED = 'Disbursed',
}

export class DisbursementScheduleItemDto {
  @ApiProperty({ example: 'First Tranche' })
  @IsString()
  milestone: string;

  @ApiProperty({ example: 25000.00 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  expectedDate: string;
}

export class CreateFundingGrantDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Donor Partner UUID' })
  @IsUUID(4)
  partnerId: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000', description: 'Linked Project UUID' })
  @IsOptional()
  @IsUUID(4)
  projectId?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000', description: 'Linked Resource Contribution UUID' })
  @IsOptional()
  @IsUUID(4)
  resourceContributionId?: string;

  @ApiProperty({ example: 'UNDP' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  donorName: string;

  @ApiProperty({ example: 150000.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @MaxLength(3)
  currency: string;

  @ApiProperty({ required: false, example: '2026-01-10' })
  @IsOptional()
  @IsDateString()
  submissionDate?: string;

  @ApiProperty({ required: false, example: '2026-02-15' })
  @IsOptional()
  @IsDateString()
  approvalDate?: string;

  @ApiProperty({ required: false, example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2027-03-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: GrantStatus, default: GrantStatus.CONCEPT })
  @IsOptional()
  @IsEnum(GrantStatus)
  status?: GrantStatus = GrantStatus.CONCEPT;

  @ApiProperty({ required: false, example: 'UNDP-GR-2026-882' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  grantReferenceNumber?: string;

  @ApiProperty({ required: false, example: 'Research and deployment grant for translation.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [DisbursementScheduleItemDto] })
  @IsOptional()
  @IsArray()
  @Type(() => DisbursementScheduleItemDto)
  disbursementSchedule?: DisbursementScheduleItemDto[];
}
