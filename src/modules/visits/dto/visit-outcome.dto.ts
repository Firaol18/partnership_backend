// src/modules/visits/dto/visit-outcome.dto.ts
import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisitOutcomeDto {
  @ApiProperty({ example: 'Discussed partnership framework', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  keyTopicsDiscussed?: string;

  @ApiProperty({ example: 'Agreed to sign MOU next month', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  opportunitiesIdentified?: string;

  @ApiProperty({ example: 'Follow up on budget approval', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  agreementsReached?: string;

  @ApiProperty({ example: 'Schedule quarterly review', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  followUpActions?: string;
}
