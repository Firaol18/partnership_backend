// src/modules/agreements/dto/terminate-agreement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class TerminateAgreementDto {
  @ApiProperty({ example: 'Agreement terminated by mutual consent.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  terminationNote?: string;
}
