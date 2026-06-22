export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
  active?: boolean;
}
