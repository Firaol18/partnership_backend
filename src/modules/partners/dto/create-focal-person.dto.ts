// src/modules/partners/dto/create-focal-person.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateFocalPersonDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  userId: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ required: false, example: 'Partnerships Officer' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiProperty({ required: false, example: 'Knowledge & Ecosystem Division' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  division?: string;

  @ApiProperty({ required: false, example: 'Partnerships Directorate' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  directorate?: string;

  @ApiProperty({ required: false, example: 'john.doe@eaii.org' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: '+251911234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}
