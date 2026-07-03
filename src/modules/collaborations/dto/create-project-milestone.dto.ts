// src/modules/collaborations/dto/create-project-milestone.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
}

export class CreateProjectMilestoneDto {
  @ApiProperty({ example: 'Complete UI mockups' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  milestoneName: string;

  @ApiProperty({ required: false, example: 'Design and finalize mockups with partner feedback.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ required: false, example: '2026-04-14' })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiProperty({ enum: MilestoneStatus, default: MilestoneStatus.PENDING })
  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus = MilestoneStatus.PENDING;

  @ApiProperty({ required: false, example: 0.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percentageComplete?: number = 0.00;
}
