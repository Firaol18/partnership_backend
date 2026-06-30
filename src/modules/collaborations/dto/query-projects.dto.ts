// src/modules/collaborations/dto/query-projects.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, ProjectThematicArea } from './create-project.dto';

export class QueryProjectsDto {
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

  @ApiProperty({ required: false, example: 'Healthcare' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: ProjectThematicArea })
  @IsOptional()
  @IsEnum(ProjectThematicArea)
  thematicArea?: ProjectThematicArea;

  @ApiProperty({ required: false, enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ required: false, example: 'approved' })
  @IsOptional()
  @IsString()
  approvalStatus?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  partnerId?: string;
}
