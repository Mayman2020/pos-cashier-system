export interface Branch {
  id: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

export interface BranchRequest {
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}
