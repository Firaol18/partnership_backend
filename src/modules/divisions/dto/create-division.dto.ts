// src/modules/divisions/dto/create-division.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDivisionDto {
  @ApiProperty({ example: 'Engineering', description: 'Division name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID of the division director',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  directorId?: string;
}
