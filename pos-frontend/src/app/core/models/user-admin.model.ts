export interface PosUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  branchId?: number;
  roles: string[];
  active: boolean;
  mustChangePassword?: boolean;
}

export interface UserRequest {
  username: string;
  email: string;
  password?: string;
  fullName?: string;
  phone?: string;
  branchId?: number;
  roles?: string[];
  active?: boolean;
}
