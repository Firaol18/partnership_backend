// src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const {
      email,
      password,
      fullName,
      phone,
      position,
      directorate,
      divisionId,
      roleIds,
      status,
      isEmailVerified,
    } = createUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check division exists
    if (divisionId) {
      const division = await this.prisma.division.findUnique({
        where: { id: divisionId },
      });
      if (!division) {
        throw new BadRequestException('Division not found');
      }
    }

    // Validate roles
    if (roleIds && roleIds.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: roleIds } },
      });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        fullName,
        phone,
        position,
        directorate,
        divisionId,
        status: status || 'ACTIVE',
        isEmailVerified: isEmailVerified || false,
        lastPasswordChangeAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles:
          roleIds && roleIds.length > 0
            ? {
                create: roleIds.map((roleId) => ({
                  id: crypto.randomUUID(),
                  roleId,
                  createdAt: new Date(),
                })),
              }
            : undefined,
      },
      include: {
        division: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(user);
  }

  async findAll(query: QueryUsersDto): Promise<{
    data: UserResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      divisionId,
      position,
      directorate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDeleted = false,
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (status) {
      where.status = status;
    }

    if (divisionId) {
      where.divisionId = divisionId;
    }

    if (position) {
      where.position = { contains: position, mode: 'insensitive' };
    }

    if (directorate) {
      where.directorate = { contains: directorate, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get users with pagination
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        division: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const data = users.map((user) => this.mapToResponseDto(user));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        division: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        division: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const {
      fullName,
      phone,
      profilePicture,
      position,
      directorate,
      divisionId,
      roleIds,
      status,
      isEmailVerified,
    } = updateUserDto;

    // Check user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check division exists
    if (divisionId) {
      const division = await this.prisma.division.findUnique({
        where: { id: divisionId },
      });
      if (!division) {
        throw new BadRequestException('Division not found');
      }
    }

    // Validate roles
    if (roleIds) {
      const roles = await this.prisma.role.findMany({
        where: { id: { in: roleIds } },
      });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }
    }

    // Update user
    const updateData: Prisma.UserUpdateInput = {
      fullName,
      phone,
      profilePicture,
      position,
      directorate,
      status,
      isEmailVerified,
      updatedAt: new Date(),
    };

    if (divisionId !== undefined) {
      updateData.division = {
        connect: { id: divisionId },
      };
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    // Update roles if provided
    if (roleIds) {
      // Delete existing roles
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // Add new roles
      updateData.userRoles = {
        create: roleIds.map((roleId) => ({
          id: crypto.randomUUID(),
          roleId,
          createdAt: new Date(),
        })),
      };
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        division: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(user);
  }

  async remove(id: string, hardDelete: boolean = false): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (hardDelete) {
      // Hard delete
      await this.prisma.user.delete({
        where: { id },
      });
    } else {
      // Soft delete
      await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'INACTIVE',
          updatedAt: new Date(),
        },
      });
    }
  }

  async restore(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }

    const restoredUser = await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      include: {
        division: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(restoredUser);
  }

  async getUsersByDivision(divisionId: string): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        divisionId,
        deletedAt: null,
        status: 'ACTIVE',
      },
      include: {
        division: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return users.map((user) => this.mapToResponseDto(user));
  }

  private mapToResponseDto(user: any): UserResponseDto {
    // 1. Map and clean the roles array (strip timestamps & joins if needed, or match target)
    const roles =
      user.userRoles?.map((ur: any) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })) || [];

    // 2. Extract and flatten your permissions matrix
    const permissions =
      user.userRoles?.flatMap(
        (ur: any) =>
          ur.role.rolePermissions?.map(
            (rp: any) => `${rp.permission.resource}:${rp.permission.action}`,
          ) || [],
      ) || [];

    // 3. Return the payload wrapped in the precise custom layout structure
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        profilePicture: user.profilePicture,
        position: user.position,
        directorate: user.directorate,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      division: user.division
        ? {
            id: user.division.id,
            name: user.division.name,
            createdAt: user.division.createdAt, // Pass through to satisfy the DTO type
            updatedAt: user.division.updatedAt,
          }
        : null,
      roles,
      permissions: [...new Set(permissions)] as string[],
    };
  }
}
