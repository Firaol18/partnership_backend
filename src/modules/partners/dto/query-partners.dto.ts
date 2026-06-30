// src/modules/partners/dto/query-partners.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPartnersDto {
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

  @ApiProperty({ required: false, example: 'UNDP' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000', description: 'PartnerStatus ID' })
  @IsOptional()
  @IsUUID(4)
  statusId?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  organizationTypeId?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID(4)
  partnerClassificationId?: string;

  @ApiProperty({ required: false, example: 'Ethiopia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, enum: ['FORMAL', 'DIRECT'] })
  @IsOptional()
  @IsEnum(['FORMAL', 'DIRECT'])
  registrationPath?: 'FORMAL' | 'DIRECT';

  @ApiProperty({ required: false, example: 'partnerName' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
