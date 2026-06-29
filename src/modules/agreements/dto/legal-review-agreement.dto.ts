// src/modules/agreements/dto/legal-review-agreement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class LegalReviewAgreementDto {
  @ApiProperty({ enum: ['Approved', 'Rejected'] })
  @IsEnum(['Approved', 'Rejected'])
  status: 'Approved' | 'Rejected';

  @ApiProperty({ example: 'The agreement terms have been verified and look good.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
