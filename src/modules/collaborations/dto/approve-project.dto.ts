// src/modules/collaborations/dto/approve-project.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveProjectDto {
  @ApiProperty({ enum: ['approved', 'rejected'], example: 'approved' })
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiProperty({ required: false, example: 'Resource allocation verified and DG approval granted.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
