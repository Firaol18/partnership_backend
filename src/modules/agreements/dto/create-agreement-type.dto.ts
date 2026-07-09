import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateAgreementTypeDto {
  @ApiProperty({ description: 'Unique name for the agreement type', example: 'MoU' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  typeName: string;

  @ApiProperty({ description: 'Description of the agreement type', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
