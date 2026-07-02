import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCollaborationDto {
  @ApiProperty({
    example: 'Joint AI Research Initiative',
    description: 'Title of the collaboration',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'A collaborative research project focused on AI applications in healthcare',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ['Joint Activity', 'Project', 'Resource Contribution', 'Funding and Grant'],
    description: 'Type of collaboration',
  })
  @IsEnum(['Joint Activity', 'Project', 'Resource Contribution', 'Funding and Grant'])
  collaborationType: string;

  @ApiProperty({
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Partner ID (required)',
  })
  @IsUUID(4)
  partnerId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    description: 'Agreement ID (optional)',
  })
  @IsOptional()
  @IsUUID(4)
  agreementId?: string;

  @ApiProperty({
    enum: ['Planned', 'Ongoing', 'Completed', 'Delayed', 'Cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Planned', 'Ongoing', 'Completed', 'Delayed', 'Cancelled'])
  status?: string;
}
