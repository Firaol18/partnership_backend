// src/modules/divisions/dto/update-division.dto.ts
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDivisionDto {
  @ApiProperty({
    example: 'Engineering',
    description: 'Division name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID of the division director',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  directorId?: string;
}
