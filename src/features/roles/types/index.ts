export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface RolesResponse {
  data: Role[];
}

export interface PermissionsResponse {
  data: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name: string;
  permissions?: string[];
}
