// src/modules/collaborations/dto/create-activity-output.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OutputType {
  PLANNED = 'planned',
  ACTUAL = 'actual',
}

export enum OutputStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
}

export class CreateActivityOutputDto {
  @ApiProperty({ enum: OutputType, example: OutputType.PLANNED })
  @IsEnum(OutputType)
  outputType: OutputType;

  @ApiProperty({ example: 'Amharic corpus clean dataset' })
  @IsString()
  @MinLength(1)
  outputDescription: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ required: false, example: 'Dataset' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({ required: false, example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiProperty({ enum: OutputStatus, default: OutputStatus.PENDING })
  @IsOptional()
  @IsEnum(OutputStatus)
  status?: OutputStatus = OutputStatus.PENDING;
}
