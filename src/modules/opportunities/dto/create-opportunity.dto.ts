
import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  IsEmail,
  MinLength,
  MaxLength,
  IsArray,
  IsObject,
  IsUrl,
  IsJSON,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty({
    example: 'Partnership with Tech Corp for Digital Transformation',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: '2024-12-01' })
  @IsDateString()
  dateIdentified: string;

  @ApiProperty({
    example: 'Tech Corp',
    description: 'Partner name (always captured)',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  partnerName: string;

  @ApiProperty({ example: 'TC', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  partnerAcronym?: string;

  @ApiProperty({ example: 'Private', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  organizationType?: string;

  @ApiProperty({ example: 'Ethiopia', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: 'Addis Ababa', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiProperty({ example: 'Addis Ababa', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'https://techcorp.com', required: false })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPersonName?: string;

  @ApiProperty({ example: 'CEO', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPosition?: string;

  @ApiProperty({ example: 'john@techcorp.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;

  @ApiProperty({ example: '+251912345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @ApiProperty({
    enum: ['New Partner', 'Existing Partner', 'Former Partner'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['New Partner', 'Existing Partner', 'Former Partner'])
  existingRelationship?: string;

  @ApiProperty({
    example: 'Digital transformation and innovation',
    required: false,
  })
  @IsOptional()
  @IsString()
  interestArea?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  strategicImportanceLevelId?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  opportunityCategoryId?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  opportunitySourceId?: string;

  @ApiProperty({
    example: 'Background information about the opportunity',
    required: false,
  })
  @IsOptional()
  @IsString()
  opportunityBackground?: string;

  @ApiProperty({
    example: 'Detailed description of the opportunity',
    required: false,
  })
  @IsOptional()
  @IsString()
  opportunityDescription?: string;

  @ApiProperty({ example: 'Areas for collaboration', required: false })
  @IsOptional()
  @IsString()
  proposedCollaborationArea?: string;

  @ApiProperty({
    example: 'Expected outcomes from this opportunity',
    required: false,
  })
  @IsOptional()
  @IsString()
  expectedOutcome?: string;

  @ApiProperty({
    example: '["Strategic Goal 1", "Strategic Goal 2"]',
    required: false,
  })
  @IsOptional()
  @IsJSON()
  strategicAlignment?: string;

  @ApiProperty({ example: '["Benefit 1", "Benefit 2"]', required: false })
  @IsOptional()
  @IsJSON()
  expectedBenefits?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  partnerId?: string;

  @ApiProperty({
    enum: ['Draft', 'Under Review', 'Approved', 'Rejected', 'Converted'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Draft', 'Under Review', 'Approved', 'Rejected', 'Converted'])
  status?: string;
}
