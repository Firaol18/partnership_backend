// src/modules/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from '../../roles/dto/role-response.dto';
import { DivisionResponseDto } from '../../divisions/dto/division-response.dto';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty({ nullable: true })
  profilePicture: string | null;

  @ApiProperty({ nullable: true })
  position: string | null;

  @ApiProperty({ nullable: true })
  directorate: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}
export class UserResponseDto {
  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ type: () => DivisionResponseDto, nullable: true })
  division: DivisionResponseDto | null;

  @ApiProperty({ type: [RoleResponseDto] })
  roles: RoleResponseDto[];

  @ApiProperty({ type: [String], example: ['users:read', 'users:create'] })
  permissions: string[];
}
