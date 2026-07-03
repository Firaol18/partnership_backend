// src/modules/documents/dto/create-document.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
  IsArray,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentDto {
  @ApiProperty({ example: 'MoU Draft EAII & UNDP' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  documentName: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'DocumentType ID' })
  @IsUUID(4)
  documentTypeId: string;

  @ApiProperty({ required: false, example: 'Draft version of the joint research MoU.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'mou-undp-draft.pdf' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ example: 'https://storage.eaii.org/documents/mou-undp-draft.pdf' })
  @IsString()
  @MinLength(1)
  filePath: string;

  @ApiProperty({ required: false, example: 2048576, description: 'File size in bytes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  fileSize?: number;

  @ApiProperty({ required: false, example: 'pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  fileFormat?: string;

  @ApiProperty({ required: false, example: 'application/pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiProperty({ required: false, example: '1.0' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string = '1.0';

  @ApiProperty({
    required: false,
    enum: ['opportunity', 'engagement', 'agreement', 'partner', 'event', 'visit', 'collaboration', 'joint_activity', 'project', 'resource', 'grant'],
    example: 'agreement',
  })
  @IsOptional()
  @IsEnum([
    'opportunity',
    'engagement',
    'agreement',
    'partner',
    'event',
    'visit',
    'collaboration',
    'joint_activity',
    'project',
    'resource',
    'grant',
  ])
  entityType?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  entityId?: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @ApiProperty({ required: false, enum: ['public', 'internal', 'restricted', 'confidential'], example: 'internal' })
  @IsOptional()
  @IsEnum(['public', 'internal', 'restricted', 'confidential'])
  accessLevel?: string = 'internal';

  @ApiProperty({ required: false, example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  accessExpiryDate?: string;

  @ApiProperty({ required: false, example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, type: [String], example: ['mou', 'draft', 'undp'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
