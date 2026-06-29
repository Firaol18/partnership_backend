// src/modules/partners/dto/review-partner.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewPartnerDto {
  @ApiProperty({ enum: ['Approved', 'Rejected'] })
  @IsEnum(['Approved', 'Rejected'])
  status: 'Approved' | 'Rejected';

  @ApiProperty({ required: false, example: 'Partner information verified and complete.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
