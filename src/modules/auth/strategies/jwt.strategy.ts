import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  JwtPayload,
  AuthUser,
} from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Get the secret - same logic as your working project
    const secret =
      configService.get<string>('JWT_ACCESS_SECRET') ||
      configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET or JWT_SECRET must be set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    console.log('=== JWT Strategy Config ===');
    console.log('Secret:', secret);
    console.log('===========================');

    this.logger.log(
      'JwtStrategy initialized with dynamic configuration secret.',
    );
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    this.logger.log(`Validating payload: ${JSON.stringify(payload)}`);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
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

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Check token version
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        `Account is ${user.status.toLowerCase()}`,
      );
    }

    // Extract roles and permissions
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map(
        (rp) => `${rp.permission.resource}:${rp.permission.action}`,
      ),
    );

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      divisionId: user.divisionId || undefined,
      roles,
      permissions,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      phone: user.phone,
      position: user.position,
      directorate: user.directorate,
      profilePicture: user.profilePicture,
    };
  }
}
