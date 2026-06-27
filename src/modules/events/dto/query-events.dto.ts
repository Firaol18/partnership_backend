// src/modules/events/dto/query-events.dto.ts
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryEventsDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false, example: 'Tech Conference' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: [
      'Planned',
      'Ongoing',
      'Completed',
      'Cancelled',
      'Follow-up Required',
    ],
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

  @ApiProperty({
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4)
  eventTypeId?: string;

  @ApiProperty({
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4)
  eventCategoryId?: string;

  @ApiProperty({
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4)
  partnerId?: string;

  @ApiProperty({ required: false, example: '2024-12-15' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({ required: false, example: 'eventDate' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'eventDate';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
