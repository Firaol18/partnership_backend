// src/modules/events/dto/create-outcome.dto.ts
import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOutcomeDto {
  @ApiProperty({ example: 'Discussed partnership framework', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  keyDiscussions?: string;

  @ApiProperty({ example: 'Agreed to sign MOU next month', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  agreementsReached?: string;

  @ApiProperty({ example: 'Follow up on budget approval', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  actionPoints?: string;

  @ApiProperty({ example: 'All objectives met', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  objectivesAchieved?: string;

  @ApiProperty({ example: 'Schedule quarterly review', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  recommendations?: string;
}
