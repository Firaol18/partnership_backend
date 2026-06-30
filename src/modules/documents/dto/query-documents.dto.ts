// src/modules/documents/dto/query-documents.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryDocumentsDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false, example: 'MoU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  documentTypeId?: string;

  @ApiProperty({ required: false, example: 'agreement' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  entityId?: string;

  @ApiProperty({ required: false, enum: ['public', 'internal', 'restricted', 'confidential'], example: 'internal' })
  @IsOptional()
  @IsEnum(['public', 'internal', 'restricted', 'confidential'])
  accessLevel?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ required: false, example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
