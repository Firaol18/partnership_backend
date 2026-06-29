// src/modules/agreements/dto/renew-agreement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RenewAgreementDto {
  @ApiProperty({ example: '2028-01-01' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '2027-12-01', required: false })
  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @ApiProperty({ example: 'Renewing the partnership agreement for another year.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
