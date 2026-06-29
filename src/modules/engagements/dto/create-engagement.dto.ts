// src/modules/engagements/dto/create-engagement.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsArray,
  ArrayUnique,
  MinLength,
  MaxLength,
  IsEmail,
  IsInt,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExternalParticipantDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'Tech Corp' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  organizationName: string;

  @ApiProperty({ example: 'CEO', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  position?: string;

  @ApiProperty({ example: 'john@techcorp.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ example: '+251912345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;
}

export class CreateEaiiRepresentativeDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  userId?: string;

  @ApiProperty({ example: 'Partnership Division' })
  @IsString()
  @MaxLength(100)
  division: string;

  @ApiProperty({ example: 'jane@eaii.org' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Lead', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;
}

export class CreateEngagementDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  opportunityId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  engagementTypeId: string;

  @ApiProperty({ example: '2024-12-20' })
  @IsDateString()
  engagementDate: string;

  @ApiProperty({ example: 'Partnership Kickoff Meeting' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({ example: '10:00:00', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ example: '12:00:00', required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ example: 'Discussed partnership framework and next steps' })
  @IsString()
  @MinLength(10)
  keyPoints: string;

  @ApiProperty({ example: 'Draft MoU, Schedule follow-up' })
  @IsString()
  @MinLength(10)
  agreedActions: string;

  @ApiProperty({ example: 'Review draft MoU by next week' })
  @IsString()
  @MinLength(10)
  nextSteps: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiProperty({ example: '2025-01-15', required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({ example: 'Follow-up on MoU progress', required: false })
  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @ApiProperty({
    enum: ['Draft', 'In Progress', 'Completed', 'Cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Draft', 'In Progress', 'Completed', 'Cancelled'])
  status?: string;

  @ApiProperty({ type: [CreateExternalParticipantDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  externalParticipants?: CreateExternalParticipantDto[];

  @ApiProperty({ type: [CreateEaiiRepresentativeDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  eaiiRepresentatives?: CreateEaiiRepresentativeDto[];
}
