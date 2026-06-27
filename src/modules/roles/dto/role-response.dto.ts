// src/modules/roles/dto/role-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt?: Date;

  @ApiProperty({ type: [PermissionResponseDto], required: false })
  permissions?: PermissionResponseDto[];
}
