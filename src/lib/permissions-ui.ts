"use client";

/**
 * Check if a user has permission to access a section of the UI
 * This is a client-side helper for rendering UI elements conditionally
 */
export function hasPermissionForSection(
  userPermissions: string[],
  requiredPermission?: string
): boolean {
  // If no permission is required, allow access
  if (!requiredPermission) {
    return true;
  }

  // Check if user has the required permission
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if a user has any of the required permissions
 * Useful for showing sections that require at least one of several permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  if (requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.some((permission: any) =>
    userPermissions.includes(permission)
  );
}

/**
 * Check if a user has all of the required permissions
 * Useful for actions that require multiple permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  if (requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}
