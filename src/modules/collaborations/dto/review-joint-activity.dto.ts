// src/modules/collaborations/dto/review-joint-activity.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewJointActivityDto {
  @ApiProperty({ enum: ['approved', 'rejected', 'under_review'], example: 'approved' })
  @IsEnum(['approved', 'rejected', 'under_review'])
  status: 'approved' | 'rejected' | 'under_review';

  @ApiProperty({ required: false, example: 'All resources are aligned correctly.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
