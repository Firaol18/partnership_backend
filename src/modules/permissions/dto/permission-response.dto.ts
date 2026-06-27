// src/modules/permissions/dto/permission-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt?: Date;
}

export class PermissionWithRolesDto extends PermissionResponseDto {
  @ApiProperty({ type: [Object] })
  roles?: {
    id: string;
    name: string;
    description?: string;
  }[];
}
