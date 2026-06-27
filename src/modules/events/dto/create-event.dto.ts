// src/modules/events/dto/create-event.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  IsEnum,
  IsNumber,
  IsArray,
  IsEmail,
  MinLength,
  MaxLength,
  ArrayUnique,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'ABC Corporation' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  organizationName: string;

  @ApiProperty({ example: 'CEO', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  position?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '+251912345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiProperty({
    enum: ['Speaker', 'Guest', 'VIP', 'Regular', 'Panelist'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Speaker', 'Guest', 'VIP', 'Regular', 'Panelist'])
  participantType?: string;
}

export class CreateEaiiParticipantDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  userId: string;
}

export class CreateBudgetDto {
  @ApiProperty({ example: 10000.0, required: false })
  @IsOptional()
  @IsNumber()
  estimatedBudget?: number;

  @ApiProperty({ example: 9500.0, required: false })
  @IsOptional()
  @IsNumber()
  actualBudget?: number;

  @ApiProperty({ example: 'Government Grant', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fundingSource?: string;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Annual Tech Conference 2024' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Tech Conference 2024' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  eventName: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  eventTypeId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  eventCategoryId: string;

  @ApiProperty({ example: '2024-12-15' })
  @IsDateString()
  eventDate: string;

  @ApiProperty({ example: '09:00:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '17:00:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'Convention Center, Addis Ababa' })
  @IsString()
  @MaxLength(255)
  venue: string;

  @ApiProperty({ example: 'Ministry of Innovation', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizer?: string;

  @ApiProperty({ example: 'Tech Hub Ethiopia', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  coOrganizer?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  eventModeId: string;

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
  })
  @IsEnum([
    'Planned',
    'Ongoing',
    'Completed',
    'Cancelled',
    'Follow-up Required',
  ])
  status?: string;

  @ApiProperty({ type: [CreateParticipantDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  participants?: CreateParticipantDto[];

  @ApiProperty({ type: [CreateEaiiParticipantDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  eaiiParticipants?: CreateEaiiParticipantDto[];

  @ApiProperty({ type: () => CreateBudgetDto, required: false })
  @IsOptional()
  budget?: CreateBudgetDto;
}
