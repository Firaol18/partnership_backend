// src/modules/collaborations/dto/query-resource-contributions.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceStatus } from './create-resource-contribution.dto';

export class QueryResourceContributionsDto {
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

  @ApiProperty({ required: false, example: 'GPU' })
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
  projectId?: string;

  @ApiProperty({ required: false, enum: ResourceStatus })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;
}
