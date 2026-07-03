// src/modules/agreements/dto/approve-agreement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveAgreementDto {
  @ApiProperty({ enum: ['Approved', 'Rejected'] })
  @IsEnum(['Approved', 'Rejected'])
  status: 'Approved' | 'Rejected';

  @ApiProperty({ example: 'Approved for signing.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
