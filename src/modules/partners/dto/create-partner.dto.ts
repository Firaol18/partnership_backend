// src/modules/partners/dto/create-partner.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsUrl,
  IsEmail,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsDecimal,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartnerDto {
  @ApiProperty({ enum: ['FORMAL', 'DIRECT'], example: 'DIRECT' })
  @IsEnum(['FORMAL', 'DIRECT'])
  registrationPath: 'FORMAL' | 'DIRECT';

  // PATH A links (required when FORMAL)
  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  agreementId?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  opportunityId?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  engagementId?: string;

  // Basic Information
  @ApiProperty({ example: 'United Nations Development Programme' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  partnerName: string;

  @ApiProperty({ required: false, example: 'UNDP' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  acronym?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  organizationTypeId?: string;

  @ApiProperty({ example: 'Ethiopia' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @ApiProperty({ required: false, example: 'Addis Ababa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  regionState?: string;

  @ApiProperty({ required: false, example: 'Addis Ababa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ required: false, example: 'Bole Sub-City, Woreda 03, House No. 123' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, example: 'https://www.undp.org' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiProperty({ required: false, example: 1965 })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  @Type(() => Number)
  yearEstablished?: number;

  @ApiProperty({ required: false, example: 'REG-2023-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationLicenseNumber?: string;

  @ApiProperty({ required: false, example: 'TAX-123456' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxNumber?: string;

  @ApiProperty({ required: false, example: 'https://storage.eaii.org/logos/undp.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  // Organization Details
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  strategicFocusAreas?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keyExpertiseAreas?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  aiFocusAreas?: string;

  @ApiProperty({ required: false, example: 5000000.00 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  annualBudget?: number;

  @ApiProperty({ required: false, example: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  numberOfEmployees?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  geographicCoverage?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  partnerClassificationId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'PartnerStatus ID (e.g. Prospect)' })
  @IsUUID(4)
  statusId: string;
}
