export interface Role {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at?: string;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  created_at?: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at?: string;
}

export interface UserWithPermissions {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    user_type?: string;
  };
  roles: Role[];
  permissions: Permission[];
}
