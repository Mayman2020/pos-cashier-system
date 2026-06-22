export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: UserDto;
}

export interface UserDto {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  branchId?: number;
  roles?: string[];
  mustChangePassword?: boolean;
}

export interface CurrentUser {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  branchId?: number;
  role: UserRole;
  roles: UserRole[];
  mustChangePassword?: boolean;
  initials?: string;
}
