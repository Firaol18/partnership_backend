// src/modules/collaborations/dto/create-resource-contribution.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ResourceStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export class CreateResourceContributionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Partner UUID' })
  @IsUUID(4)
  partnerId: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000', description: 'Linked Project UUID' })
  @IsOptional()
  @IsUUID(4)
  projectId?: string;

  // EAII Contribution
  @ApiProperty({ required: false, example: '3 Senior NLP Researchers' })
  @IsOptional()
  @IsString()
  eaiiStaff?: string;

  @ApiProperty({ required: false, example: '2 High-performance GPU servers' })
  @IsOptional()
  @IsString()
  eaiiInfrastructure?: string;

  @ApiProperty({ required: false, example: 50000.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  eaiiFunding?: number;

  @ApiProperty({ required: false, example: 'Local networking hardware' })
  @IsOptional()
  @IsString()
  eaiiEquipment?: string;

  @ApiProperty({ required: false, example: 'Annotated Amharic raw text corpus' })
  @IsOptional()
  @IsString()
  eaiiDataResources?: string;

  // Partner Contribution
  @ApiProperty({ required: false, example: '4 Software Engineers' })
  @IsOptional()
  @IsString()
  partnerStaff?: string;

  @ApiProperty({ required: false, example: 75000.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  partnerFunding?: number;

  @ApiProperty({ required: false, example: 'Proprietary translation API access' })
  @IsOptional()
  @IsString()
  partnerTechnology?: string;

  @ApiProperty({ required: false, example: 'Cloud credits worth $5k' })
  @IsOptional()
  @IsString()
  partnerEquipment?: string;

  @ApiProperty({ required: false, example: 'Speech-to-text annotation knowledge' })
  @IsOptional()
  @IsString()
  partnerExpertise?: string;

  // Estimated Value
  @ApiProperty({ required: false, example: 125000.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedMonetaryValue?: number;

  @ApiProperty({ required: false, example: 15000.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedInKindValue?: number;

  @ApiProperty({ required: false, example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ enum: ResourceStatus, default: ResourceStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus = ResourceStatus.ACTIVE;
}
