import { IsOptional, IsInt, Min, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryCollaborationsDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    enum: ['Planned', 'Ongoing', 'Completed', 'Delayed', 'Cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Planned', 'Ongoing', 'Completed', 'Delayed', 'Cancelled'])
  status?: string;

  @ApiProperty({
    enum: ['Joint Activity', 'Project', 'Resource Contribution', 'Funding and Grant'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Joint Activity', 'Project', 'Resource Contribution', 'Funding and Grant'])
  collaborationType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({ required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
