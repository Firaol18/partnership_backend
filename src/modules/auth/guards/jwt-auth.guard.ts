// src/modules/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Log for debugging
    const request = context.switchToHttp().getRequest();

    console.log(
      'Authorization:',
      request.headers.authorization ? 'Present' : 'Missing',
    );
    console.log('===================');

    if (isPublic) {
      return true; // Skip JWT validation for public routes
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // If error or no user, throw UnauthorizedException
    if (err || !user) {
      console.log('JWT Validation failed:', { err, info });
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
