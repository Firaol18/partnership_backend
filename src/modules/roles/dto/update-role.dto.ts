// src/modules/roles/dto/update-role.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'super_admin',
    description: 'Unique role name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    example: 'Super administrator with all permissions',
    description: 'Role description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    description: 'Array of permission IDs to assign to this role',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(4, { each: true })
  permissionIds?: string[];
}
