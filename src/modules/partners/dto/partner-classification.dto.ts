import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePartnerClassificationDto {
  @ApiProperty({ description: 'Unique name for the partner classification', example: 'Academic' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  classificationName: string;
}

export class UpdatePartnerClassificationDto {
  @ApiProperty({ description: 'Unique name for the partner classification', required: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  classificationName: string;
}
