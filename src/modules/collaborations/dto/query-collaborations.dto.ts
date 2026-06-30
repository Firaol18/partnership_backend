// src/modules/collaborations/dto/query-collaborations.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CollaborationStatus, CollaborationType } from './create-collaboration.dto';

export class QueryCollaborationsDto {
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

  @ApiProperty({ required: false, example: 'AI Research' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  partnerId?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  agreementId?: string;

  @ApiProperty({ required: false, enum: CollaborationType })
  @IsOptional()
  @IsEnum(CollaborationType)
  collaborationType?: CollaborationType;

  @ApiProperty({ required: false, enum: CollaborationStatus })
  @IsOptional()
  @IsEnum(CollaborationStatus)
  status?: CollaborationStatus;

  @ApiProperty({ required: false, example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
