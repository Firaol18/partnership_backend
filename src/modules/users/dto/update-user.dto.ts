// src/modules/users/dto/update-user.dto.ts
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
  IsPhoneNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  ArrayUnique,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsPhoneNumber()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'profile-pic.jpg', required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({ example: 'Senior Software Engineer', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiProperty({ example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  directorate?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  divisionId?: string;

  @ApiProperty({ example: ['user', 'manager'], required: false })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(4, { each: true })
  roleIds?: string[];

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}
