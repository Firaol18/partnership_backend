// src/modules/communications/dto/create-communication.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEmail,
  IsBoolean,
  IsArray,
  ArrayUnique,
  IsJSON,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommunicationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  opportunityId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  communicationTypeId: string;

  @ApiProperty({ example: 'Partnership Discussion Follow-up' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  emailSubject: string;

  @ApiProperty({ example: 'partner@organization.com' })
  @IsEmail()
  @MaxLength(255)
  emailRecipient: string;

  @ApiProperty({ example: 'Dear Partner, ...' })
  @IsString()
  @MinLength(10)
  emailBody: string;

  @ApiProperty({ example: '2024-12-15T10:00:00Z' })
  @IsDateString()
  sentDate: string;

  @ApiProperty({ example: '["colleague@example.com"]', required: false })
  @IsOptional()
  @IsJSON()
  ccRecipients?: string;

  @ApiProperty({ example: '["external@example.com"]', required: false })
  @IsOptional()
  @IsJSON()
  bccRecipients?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  hasAttachments?: boolean;
}
