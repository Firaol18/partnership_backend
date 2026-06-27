// src/modules/visits/dto/create-visit.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  IsEmail,
  MinLength,
  MaxLength,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDelegateDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'CEO', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  position?: string;

  @ApiProperty({ example: 'ABC Corporation' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  organizationName: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiProperty({ enum: ['Confirmed', 'Pending', 'Declined'], required: false })
  @IsOptional()
  @IsEnum(['Confirmed', 'Pending', 'Declined'])
  status?: string;
}

export class CreateVisitDto {
  @ApiProperty({ example: 'Partnership Discussion Visit' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  visitTypeId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  visitCategoryId: string;

  @ApiProperty({ example: '2024-12-20' })
  @IsDateString()
  visitDate: string;

  @ApiProperty({ example: 'Ministry of Innovation' })
  @IsString()
  @MaxLength(255)
  hostOrganization: string;

  @ApiProperty({ example: 'Tech Corp' })
  @IsString()
  @MaxLength(255)
  visitingOrganization: string;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  visitLocation?: string;

  @ApiProperty({ example: 'Discuss new partnership opportunities', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  purpose?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  focalPersonId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  partnerId?: string;

  @ApiProperty({
    enum: [
      'Planned',
      'Ongoing',
      'Completed',
      'Cancelled',
      'Follow-up Required',
    ],
    required: false,
  })
  @IsOptional()
  @IsEnum([
    'Planned',
    'Ongoing',
    'Completed',
    'Cancelled',
    'Follow-up Required',
  ])
  status?: string;

  @ApiProperty({ type: [CreateDelegateDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  delegates?: CreateDelegateDto[];

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  @IsObject()
  outcome?: {
    keyTopicsDiscussed?: string;
    opportunitiesIdentified?: string;
    agreementsReached?: string;
    followUpActions?: string;
  };
}
