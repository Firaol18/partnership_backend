// src/modules/agreements/dto/create-agreement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SignatoryDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'CEO' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'UNDP' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  organization: string;
}

export class CreateAgreementDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  opportunityId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID(4)
  engagementId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID(4)
  partnerId?: string;

  @ApiProperty({ example: 'MOU with UNDP 2026' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  agreementTitle: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  agreementTypeId: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '2026-12-01', required: false })
  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @ApiProperty({ example: 'UNDP' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  partnerName: string;

  @ApiProperty({ example: 'Partnership Division' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  eaiiResponsibleDivision: string;

  @ApiProperty({ example: 'Knowledge Management Directorate', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  eaiiResponsibleDirectorate?: string;

  @ApiProperty({ type: [SignatoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignatoryDto)
  signatories: SignatoryDto[];
}
