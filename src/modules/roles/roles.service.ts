import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const { name, description, permissionIds } = createRoleDto;

    // Check if role exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    // Validate permissions
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('One or more permissions not found');
      }
    }

    const role = await this.prisma.role.create({
      data: {
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
        rolePermissions:
          permissionIds && permissionIds.length > 0
            ? {
                create: permissionIds.map((permissionId) => ({
                  id: crypto.randomUUID(),
                  permissionId,
                  createdAt: new Date(),
                })),
              }
            : undefined,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.mapToResponseDto(role);
  }

  async findAll(includeDeleted: boolean = false): Promise<RoleResponseDto[]> {
    const where: Prisma.RoleWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const roles = await this.prisma.role.findMany({
      where,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return roles.map((role) => this.mapToResponseDto(role));
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    return this.mapToResponseDto(role);
  }

  async findByName(name: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    return this.mapToResponseDto(role);
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const { name, description, permissionIds } = updateRoleDto;

    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole || existingRole.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    // Check if new name conflicts
    if (name && name !== existingRole.name) {
      const nameConflict = await this.prisma.role.findUnique({
        where: { name },
      });
      if (nameConflict) {
        throw new ConflictException('Role name already exists');
      }
    }

    // Validate permissions
    if (permissionIds) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('One or more permissions not found');
      }
    }

    const updateData: Prisma.RoleUpdateInput = {
      name,
      description,
      updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    // Update permissions if provided
    if (permissionIds) {
      // Delete existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      updateData.rolePermissions = {
        create: permissionIds.map((permissionId) => ({
          id: crypto.randomUUID(),
          permissionId,
          createdAt: new Date(),
        })),
      };
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.mapToResponseDto(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    // Check if role is assigned to any users
    if (role.userRoles.length > 0) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to users',
      );
    }

    await this.prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async permanentRemove(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
        rolePermissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.userRoles.length > 0) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to users',
      );
    }

    // Delete related permissions first
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Delete the role
    await this.prisma.role.delete({
      where: { id },
    });
  }

  async restore(id: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!role.deletedAt) {
      throw new BadRequestException('Role is not deleted');
    }

    const restoredRole = await this.prisma.role.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.mapToResponseDto(restoredRole);
  }

  async addPermission(
    roleId: string,
    permissionId: string,
  ): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
      update: {},
      create: {
        id: crypto.randomUUID(),
        roleId,
        permissionId,
        createdAt: new Date(),
      },
    });

    return this.findOne(roleId);
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });

    return this.findOne(roleId);
  }

  async bulkAddPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    // Validate all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permissions not found');
    }

    // Add each permission
    for (const permissionId of permissionIds) {
      await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          id: crypto.randomUUID(),
          roleId,
          permissionId,
          createdAt: new Date(),
        },
      });
    }

    return this.findOne(roleId);
  }

  async bulkRemovePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });

    return this.findOne(roleId);
  }

  private mapToResponseDto(role: any): RoleResponseDto {
    const permissions = role.rolePermissions?.map((rp) => rp.permission) || [];

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      deletedAt: role.deletedAt,
      permissions,
    };
  }
}
