import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateAgreementTypeDto {
  @ApiProperty({ description: 'Unique name for the agreement type', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  typeName?: string;

  @ApiProperty({ description: 'Description of the agreement type', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
