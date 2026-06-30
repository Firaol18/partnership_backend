// src/modules/collaborations/dto/create-project-risk.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MinLength,
} from 'class-validator';

export enum RiskSeverity {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum RiskStatus {
  OPEN = 'open',
  MITIGATING = 'mitigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export class CreateProjectRiskDto {
  @ApiProperty({ example: 'Key staff changes on partner side.' })
  @IsString()
  @MinLength(1)
  riskDescription: string;

  @ApiProperty({ required: false, example: 'Establish secondary contacts early.' })
  @IsOptional()
  @IsString()
  mitigationPlan?: string;

  @ApiProperty({ required: false, enum: RiskSeverity, example: RiskSeverity.MEDIUM })
  @IsOptional()
  @IsEnum(RiskSeverity)
  likelihood?: RiskSeverity;

  @ApiProperty({ required: false, enum: RiskSeverity, example: RiskSeverity.HIGH })
  @IsOptional()
  @IsEnum(RiskSeverity)
  impact?: RiskSeverity;

  @ApiProperty({ enum: RiskStatus, default: RiskStatus.OPEN })
  @IsOptional()
  @IsEnum(RiskStatus)
  status?: RiskStatus = RiskStatus.OPEN;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000', description: 'Internal Owner User UUID' })
  @IsOptional()
  @IsUUID(4)
  ownerId?: string;

  @ApiProperty({ example: '2026-03-10' })
  @IsDateString()
  identifiedDate: string;

  @ApiProperty({ required: false, example: '2026-05-20' })
  @IsOptional()
  @IsDateString()
  resolvedDate?: string;
}
