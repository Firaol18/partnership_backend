// src/modules/divisions/dto/division-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DivisionUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  position?: string;

  @ApiProperty({ nullable: true })
  phone?: string;
}

export class DivisionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  directorId?: string;

  @ApiProperty({ type: () => DivisionUserDto, nullable: true })
  director?: DivisionUserDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt?: Date;

  @ApiProperty({ type: [DivisionUserDto], required: false })
  users?: DivisionUserDto[];
}
