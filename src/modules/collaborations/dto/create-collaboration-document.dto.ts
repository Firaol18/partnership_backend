// src/modules/collaborations/dto/create-collaboration-document.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum CollabEntityType {
  ACTIVITY = 'activity',
  PROJECT = 'project',
  RESOURCE = 'resource',
  GRANT = 'grant',
}

export enum CollabDocumentCategory {
  PLAN = 'Plan',
  REPORT = 'Report',
  OUTPUT = 'Output',
  PRESENTATION = 'Presentation',
  BUDGET = 'Budget',
  CONTRACT = 'Contract',
  OTHER = 'Other',
}

export class CreateCollaborationDocumentDto {
  @ApiProperty({ enum: CollabEntityType, example: CollabEntityType.PROJECT })
  @IsEnum(CollabEntityType)
  entityType: CollabEntityType;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Target Entity UUID' })
  @IsUUID(4)
  entityId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Global Document UUID' })
  @IsUUID(4)
  documentId: string;

  @ApiProperty({ enum: CollabDocumentCategory, example: CollabDocumentCategory.PLAN })
  @IsEnum(CollabDocumentCategory)
  documentCategory: CollabDocumentCategory;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean = true;
}
