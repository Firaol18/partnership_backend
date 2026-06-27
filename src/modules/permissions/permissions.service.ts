// src/modules/permissions/permissions.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { QueryPermissionsDto } from './dto/query-permissions.dto';
import {
  PermissionResponseDto,
  PermissionWithRolesDto,
} from './dto/permission-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryPermissionsDto): Promise<{
    data: PermissionResponseDto[];
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
      resource,
      action,
      isActive,
      sortBy = 'resource',
      sortOrder = 'asc',
      includeDeleted = false,
      search,
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.PermissionWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (resource) {
      where.resource = { contains: resource, mode: 'insensitive' };
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { resource: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.permission.count({ where });

    // Get permissions with pagination
    const permissions = await this.prisma.permission.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const data = permissions.map((permission) =>
      this.mapToResponseDto(permission),
    );

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

  async findAllSimple(): Promise<PermissionResponseDto[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    return permissions.map((permission) => this.mapToResponseDto(permission));
  }

  async findOne(id: string): Promise<PermissionWithRolesDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permission not found');
    }

    return this.mapToResponseWithRolesDto(permission);
  }

  async findByResourceAction(
    resource: string,
    action: string,
  ): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: {
        resource_action: {
          resource,
          action,
        },
      },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permission not found');
    }

    return this.mapToResponseDto(permission);
  }

  async activate(id: string): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.isActive) {
      throw new BadRequestException('Permission is already active');
    }

    const updated = await this.prisma.permission.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponseDto(updated);
  }

  async deactivate(id: string): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              include: {
                userRoles: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permission not found');
    }

    if (!permission.isActive) {
      throw new BadRequestException('Permission is already inactive');
    }

    // Check if permission is being used by any roles with active users
    const hasActiveUsers = permission.rolePermissions.some((rp) =>
      rp.role.userRoles.some((ur) => ur.user && ur.user.deletedAt === null),
    );

    if (hasActiveUsers) {
      throw new BadRequestException(
        'Cannot deactivate permission that is assigned to roles with active users',
      );
    }

    const updated = await this.prisma.permission.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponseDto(updated);
  }

  async toggleActive(id: string): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permission not found');
    }

    const updated = await this.prisma.permission.update({
      where: { id },
      data: {
        isActive: !permission.isActive,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              include: {
                userRoles: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permission not found');
    }

    // Check if permission is being used by any roles with users
    const hasActiveUsers = permission.rolePermissions.some((rp) =>
      rp.role.userRoles.some((ur) => ur.user && ur.user.deletedAt === null),
    );

    if (hasActiveUsers) {
      throw new BadRequestException(
        'Cannot delete permission that is assigned to roles with active users',
      );
    }

    await this.prisma.permission.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
        isActive: false,
      },
    });
  }

  async permanentRemove(id: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.rolePermissions.length > 0) {
      throw new BadRequestException(
        'Cannot delete permission that is assigned to roles. Remove it from roles first.',
      );
    }

    await this.prisma.permission.delete({
      where: { id },
    });
  }

  async restore(id: string): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (!permission.deletedAt) {
      throw new BadRequestException('Permission is not deleted');
    }

    const restored = await this.prisma.permission.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
        isActive: true,
      },
    });

    return this.mapToResponseDto(restored);
  }

  async getRolesWithPermission(permissionId: string): Promise<any[]> {
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permission not found');
    }

    return permission.rolePermissions.map((rp) => rp.role);
  }

  async getPermissionsByResource(
    resource: string,
  ): Promise<PermissionResponseDto[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        resource: { equals: resource, mode: 'insensitive' },
        deletedAt: null,
        isActive: true,
      },
      orderBy: {
        action: 'asc',
      },
    });

    return permissions.map((permission) => this.mapToResponseDto(permission));
  }

  async getResources(): Promise<string[]> {
    const results = await this.prisma.permission.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        resource: true,
      },
      distinct: ['resource'],
      orderBy: {
        resource: 'asc',
      },
    });

    return results.map((r) => r.resource);
  }

  async getActionsByResource(resource: string): Promise<string[]> {
    const results = await this.prisma.permission.findMany({
      where: {
        resource: { equals: resource, mode: 'insensitive' },
        deletedAt: null,
        isActive: true,
      },
      select: {
        action: true,
      },
      orderBy: {
        action: 'asc',
      },
    });

    return results.map((r) => r.action);
  }

  private mapToResponseDto(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      isActive: permission.isActive ?? true,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      deletedAt: permission.deletedAt || null,
    };
  }

  private mapToResponseWithRolesDto(permission: any): PermissionWithRolesDto {
    const base = this.mapToResponseDto(permission);

    return {
      ...base,
      roles:
        permission.rolePermissions?.map((rp) => ({
          id: rp.role.id,
          name: rp.role.name,
          description: rp.role.description,
        })) || [],
    };
  }
}
