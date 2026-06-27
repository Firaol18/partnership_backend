import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  AuthTokens,
  AuthUser,
  LoginResponse,
} from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // Access token service
    @Inject('REFRESH_JWT') private refreshJwtService: JwtService, // Refresh token service
    private configService: ConfigService,
  ) {}

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
      // Add small delay to prevent timing attacks
      await this.delay(1000);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        `Account is locked until ${user.lockedUntil.toISOString()}`,
      );
    }

    // Check account status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        `Account is ${user.status.toLowerCase()}`,
      );
    }

    // Check if password expired
    if (user.passwordExpiresAt && user.passwordExpiresAt < new Date()) {
      throw new UnauthorizedException(
        'Password has expired. Please reset your password.',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment login attempts
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        lastLoginUserAgent: userAgent,
        failedLoginAt: null,
      },
    });

    const tokens = this.generateTokens(user);

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map(
        (rp) => `${rp.permission.resource}:${rp.permission.action}`,
      ),
    );

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      divisionId: user.divisionId || undefined,
      roles,
      permissions,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
    };

    // Log activity
    await this.logActivity(user.id, 'LOGIN', 'User', user.id, null, {
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: authUser,
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const { email, password, fullName, phone, position, divisionId } =
      registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default role (e.g., 'user')
    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!defaultRole) {
      throw new BadRequestException('Default role not configured');
    }

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        fullName,
        passwordHash: hashedPassword,
        phone,
        position,
        divisionId: divisionId ?? null,
        status: 'ACTIVE',
        isEmailVerified: false,
        tokenVersion: 0,
        loginAttempts: 0,
        lastPasswordChangeAt: new Date(),
        userRoles: {
          create: {
            roleId: defaultRole.id,
          },
        },
      },
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

    const tokens = this.generateTokens(user);

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map(
        (rp) => `${rp.permission.resource}:${rp.permission.action}`,
      ),
    );

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      divisionId: user.divisionId || undefined,
      roles,
      permissions,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
    };

    // Log registration
    await this.logActivity(user.id, 'REGISTER', 'User', user.id, null, {
      ipAddress: null,
      userAgent: null,
      timestamp: new Date().toISOString(),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: authUser,
    };
  }
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify using the refresh JWT service
      const payload = this.refreshJwtService.verify(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || user.deletedAt || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check token version
      if (user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return this.generateTokens(user);
    } catch (error) {
      console.error('Refresh token error:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        lastPasswordChangeAt: new Date(),
        tokenVersion: { increment: 1 }, // Invalidate all existing tokens
      },
    });

    // Log password change
    await this.logActivity(userId, 'CHANGE_PASSWORD', 'User', userId, null, {
      timestamp: new Date().toISOString(),
    });
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        tokenVersion: { increment: 1 }, // Invalidate tokens
      },
    });

    // Log logout
    await this.logActivity(userId, 'LOGOUT', 'User', userId, null, {
      timestamp: new Date().toISOString(),
    });
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

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

  async verifyEmail(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    // Implementation for password reset flow
    // Generate reset token, send email, etc.
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Implementation for password reset
  }

  private async handleFailedLogin(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const maxAttempts =
      this.configService.get<number>('MAX_LOGIN_ATTEMPTS') || 5;
    const lockDuration =
      this.configService.get<number>('ACCOUNT_LOCK_DURATION') || 15; // minutes

    const newAttempts = (user.loginAttempts || 0) + 1;
    const updateData: any = {
      loginAttempts: newAttempts,
      failedLoginAt: new Date(),
    };

    // Lock account if max attempts exceeded
    if (newAttempts >= maxAttempts) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + lockDuration);
      updateData.lockedUntil = lockUntil;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  private async logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
  ): Promise<void> {
    await this.prisma.userActivityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValues: oldValues || null,
        newValues: newValues || null,
      },
    });
  }

  private generateTokens(user: any): AuthTokens {
    const payload = {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion || 0,
    };

    // Use the configured JwtService without overriding secret
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.refreshJwtService.sign(payload);

    console.log('=== Tokens Generated ===');
    console.log('Access Token:', accessToken.substring(0, 30) + '...');
    console.log('Refresh Token:', refreshToken.substring(0, 30) + '...');
    console.log('========================');

    return { accessToken, refreshToken };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
