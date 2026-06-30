// src/modules/collaborations/dto/create-grant-disbursement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DisbursementStatus {
  PENDING = 'pending',
  DISBURSED = 'disbursed',
  CANCELLED = 'cancelled',
}

export class CreateGrantDisbursementDto {
  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  disbursementDate: string;

  @ApiProperty({ example: 25000.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @MaxLength(3)
  currency: string;

  @ApiProperty({ required: false, example: 'First disbursement upon signing.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'TX-DISB-9988' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @ApiProperty({ enum: DisbursementStatus, default: DisbursementStatus.PENDING })
  @IsOptional()
  @IsEnum(DisbursementStatus)
  status?: DisbursementStatus = DisbursementStatus.PENDING;
}
