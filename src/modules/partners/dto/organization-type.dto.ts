import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateOrganizationTypeDto {
  @ApiProperty({ description: 'Unique name for the organization type', example: 'Government' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  typeName: string;
}

export class UpdateOrganizationTypeDto {
  @ApiProperty({ description: 'Unique name for the organization type', required: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  typeName: string;
}
