// src/common/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string;
  email: string;
  userUid?: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  userUid?: string;
  email: string;
  fullName: string;
  divisionId?: string;
  roles: string[];
  permissions: string[];
  status: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date | null;
  phone?: string | null;
  position?: string | null;
  directorate?: string | null;
  profilePicture?: string | null;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}