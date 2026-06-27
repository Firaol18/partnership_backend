import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { DivisionResponseDto } from './dto/division-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DivisionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDivisionDto: CreateDivisionDto,
  ): Promise<DivisionResponseDto> {
    const { name, directorId } = createDivisionDto;

    // Check if division exists
    const existingDivision = await this.prisma.division.findUnique({
      where: { name },
    });

    if (existingDivision) {
      throw new ConflictException('Division already exists');
    }

    // Check director exists
    if (directorId) {
      const director = await this.prisma.user.findUnique({
        where: { id: directorId },
      });
      if (!director) {
        throw new BadRequestException('Director not found');
      }
    }

    const division = await this.prisma.division.create({
      data: {
        name,
        directorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        director: true,
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            profilePicture: true,
          },
        },
      },
    });

    return this.mapToResponseDto(division);
  }

  async findAll(
    includeDeleted: boolean = false,
  ): Promise<DivisionResponseDto[]> {
    const where: Prisma.DivisionWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const divisions = await this.prisma.division.findMany({
      where,
      include: {
        director: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            phone: true,
          },
        },
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return divisions.map((division) => this.mapToResponseDto(division));
  }

  async findOne(id: string): Promise<DivisionResponseDto> {
    const division = await this.prisma.division.findUnique({
      where: { id },
      include: {
        director: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            phone: true,
          },
        },
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    return this.mapToResponseDto(division);
  }

  async update(
    id: string,
    updateDivisionDto: UpdateDivisionDto,
  ): Promise<DivisionResponseDto> {
    const { name, directorId } = updateDivisionDto;

    const existingDivision = await this.prisma.division.findUnique({
      where: { id },
    });

    if (!existingDivision) {
      throw new NotFoundException('Division not found');
    }

    // Check if new name conflicts
    if (name && name !== existingDivision.name) {
      const nameConflict = await this.prisma.division.findUnique({
        where: { name },
      });
      if (nameConflict) {
        throw new ConflictException('Division name already exists');
      }
    }

    // Check director exists
    if (directorId) {
      const director = await this.prisma.user.findUnique({
        where: { id: directorId },
      });
      if (!director) {
        throw new BadRequestException('Director not found');
      }
    }

    const updateData: Prisma.DivisionUpdateInput = {
      name,
      director: directorId ? { connect: { id: directorId } } : undefined,
      updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const division = await this.prisma.division.update({
      where: { id },
      data: updateData,
      include: {
        director: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            phone: true,
          },
        },
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            profilePicture: true,
          },
        },
      },
    });

    return this.mapToResponseDto(division);
  }

  async remove(id: string): Promise<void> {
    const division = await this.prisma.division.findUnique({
      where: { id },
      include: {
        users: {
          where: { deletedAt: null },
        },
      },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    // Check if division has active users
    if (division.users.length > 0) {
      throw new BadRequestException(
        'Cannot delete division that has active users',
      );
    }

    await this.prisma.division.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async permanentRemove(id: string): Promise<void> {
    const division = await this.prisma.division.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    if (division.users.length > 0) {
      throw new BadRequestException('Cannot delete division that has users');
    }

    await this.prisma.division.delete({
      where: { id },
    });
  }

  async restore(id: string): Promise<DivisionResponseDto> {
    const division = await this.prisma.division.findUnique({
      where: { id },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    if (!division.deletedAt) {
      throw new BadRequestException('Division is not deleted');
    }

    const restoredDivision = await this.prisma.division.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      include: {
        director: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            phone: true,
          },
        },
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            profilePicture: true,
          },
        },
      },
    });

    return this.mapToResponseDto(restoredDivision);
  }

  async assignDirector(
    divisionId: string,
    userId: string,
  ): Promise<DivisionResponseDto> {
    const division = await this.prisma.division.findUnique({
      where: { id: divisionId },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedDivision = await this.prisma.division.update({
      where: { id: divisionId },
      data: {
        directorId: userId,
        updatedAt: new Date(),
      },
      include: {
        director: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            phone: true,
          },
        },
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            profilePicture: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedDivision);
  }

  async removeDirector(divisionId: string): Promise<DivisionResponseDto> {
    const division = await this.prisma.division.findUnique({
      where: { id: divisionId },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    const updatedDivision = await this.prisma.division.update({
      where: { id: divisionId },
      data: {
        directorId: null,
        updatedAt: new Date(),
      },
      include: {
        director: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            phone: true,
          },
        },
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            profilePicture: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedDivision);
  }

  async getDivisionUsers(divisionId: string): Promise<any[]> {
    const division = await this.prisma.division.findUnique({
      where: { id: divisionId },
      include: {
        users: {
          where: { deletedAt: null },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!division) {
      throw new NotFoundException('Division not found');
    }

    return division.users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      position: user.position,
      status: user.status,
      profilePicture: user.profilePicture,
      roles: user.userRoles.map((ur) => ur.role.name),
    }));
  }

  private mapToResponseDto(division: any): DivisionResponseDto {
    return {
      id: division.id,
      name: division.name,
      directorId: division.directorId,
      director: division.director
        ? {
            id: division.director.id,
            fullName: division.director.fullName,
            email: division.director.email,
            position: division.director.position,
            phone: division.director.phone,
          }
        : undefined,
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
      deletedAt: division.deletedAt,
      users: division.users?.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        position: user.position,
        profilePicture: user.profilePicture,
      })),
    };
  }
}
