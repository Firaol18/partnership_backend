import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    const secret =
      configService.get<string>('JWT_REFRESH_SECRET') ||
      configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET or JWT_SECRET must be set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Try to get from body first
          const token = request.body?.refreshToken;
          if (token) return token;

          // Then try from Authorization header
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
          }

          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken =
      req.body?.refreshToken || req.headers.authorization?.substring(7);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
