export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';
export const USER_ROLE_VALUES: UserRole[] = ['ADMIN', 'MANAGER', 'CASHIER'];
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'menu';
export interface ModulePermission {
  enabled?: boolean;
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  menu?: boolean;
}
export type PermissionMap = Record<string, ModulePermission>;

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
  permissions?: PermissionMap;
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
  permissions?: PermissionMap;
  initials?: string;
}
