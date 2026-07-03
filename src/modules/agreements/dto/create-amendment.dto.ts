// src/modules/agreements/dto/create-amendment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAmendmentDto {
  @ApiProperty({ example: 'Amendment No. 1: Scope Expansion' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  amendmentTitle: string;

  @ApiProperty({ example: 'Expanding collaboration to include robotics research.', required: false })
  @IsOptional()
  @IsString()
  amendmentDescription?: string;

  @ApiProperty({ example: '2026-06-28' })
  @IsNotEmpty()
  @IsDateString()
  amendmentDate: string;

  @ApiProperty({ example: '2026-07-01' })
  @IsNotEmpty()
  @IsDateString()
  effectiveDate: string;

  @ApiProperty({ example: '["Clause 2.1: Scope of collaboration is extended to robotics."]', required: false })
  @IsOptional()
  changedClauses?: any;

  @ApiProperty({ example: 'Robotics research became a high priority for both parties.', required: false })
  @IsOptional()
  @IsString()
  reasonForAmendment?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID(4)
  documentId?: string;
}
