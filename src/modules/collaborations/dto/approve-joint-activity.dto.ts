// src/modules/collaborations/dto/approve-joint-activity.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveJointActivityDto {
  @ApiProperty({ enum: ['approved', 'rejected'], example: 'approved' })
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiProperty({ required: false, example: 'Final approval granted for implementation.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
