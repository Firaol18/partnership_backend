import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Access Token JWT - Similar to your working project
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret =
          configService.get<string>('JWT_ACCESS_SECRET') ||
          configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_ACCESS_SECRET or JWT_SECRET must be set');
        }

        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRATION') ||
              configService.get<string>('JWT_EXPIRATION') ||
              '15m') as `${number}` | number,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    PrismaService,
    // Refresh JWT Service - Using useFactory like your working project
    {
      provide: 'REFRESH_JWT',
      useFactory: (configService: ConfigService) => {
        const secret =
          configService.get<string>('JWT_REFRESH_SECRET') ||
          configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_REFRESH_SECRET or JWT_SECRET must be set');
        }

        return new JwtService({
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_REFRESH_EXPIRATION') ||
              configService.get<string>('JWT_EXPIRATION') ||
              '7d') as `${number}` | number,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
