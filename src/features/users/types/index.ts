export interface User {
  id: number;
  name: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  data: User[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface CreateUserPayload {
  name?: string | null;
  username: string;
  email?: string | null;
  phone?: string | null;
  password: string;
  role: string;
  is_active?: boolean;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
}

export interface UpdateUserPayload {
  id: number;
  name?: string | null;
  username: string;
  email?: string | null;
  phone?: string | null;
  password?: string | null;
  role: string;
  is_active?: boolean;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
}

export interface UserQueryParams {
  role?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
