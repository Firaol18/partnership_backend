// src/modules/collaborations/dto/create-project-deliverable.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum DeliverableStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
}

export class CreateProjectDeliverableDto {
  @ApiProperty({ example: 'Final Research Paper' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  deliverableName: string;

  @ApiProperty({ required: false, example: 'Research paper on NLP architecture modifications.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiProperty({ required: false, example: '2026-06-28' })
  @IsOptional()
  @IsDateString()
  deliveredDate?: string;

  @ApiProperty({ enum: DeliverableStatus, default: DeliverableStatus.PENDING })
  @IsOptional()
  @IsEnum(DeliverableStatus)
  status?: DeliverableStatus = DeliverableStatus.PENDING;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000', description: 'Linked Document UUID' })
  @IsOptional()
  @IsUUID(4)
  documentId?: string;
}
