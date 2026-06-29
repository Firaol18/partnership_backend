// src/modules/agreements/dto/sign-agreement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class SignAgreementDto {
  @ApiProperty({ example: 'https://storage.eaii.org/agreements/signed-agreement-2026.pdf' })
  @IsNotEmpty()
  @IsString()
  signedVersionPath: string;

  @ApiProperty({ example: '2026-06-25' })
  @IsNotEmpty()
  @IsDateString()
  signingDate: string;
}
