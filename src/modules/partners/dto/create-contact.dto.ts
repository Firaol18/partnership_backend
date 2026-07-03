// src/modules/partners/dto/create-contact.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Alice Bekele' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ required: false, example: 'Director of Partnerships' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  positionTitle?: string;

  @ApiProperty({ required: false, example: 'Partnerships Department' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  department?: string;

  @ApiProperty({ example: 'alice.bekele@undp.org' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false, example: '+251911234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mobilePhone?: string;

  @ApiProperty({ required: false, example: '+251111234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  officePhone?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ required: false, example: 'Technical liaison and project coordinator' })
  @IsOptional()
  @IsString()
  roleInPartnership?: string;
}
