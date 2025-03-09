// Define a type for route permission mappings
export interface RoutePermissionMapping {
  pattern: RegExp; // URL pattern to match
  permission: string; // Required permission
  description?: string; // Optional description for documentation
}

/**
 * Route-to-permission mapping configuration
 *
 * IMPORTANT: Order matters! More specific routes should come before general routes.
 * For example, '/finance/invoices' should come before '/finance' to ensure the more
 * specific permission is checked first.
 */
export const routePermissionMap: RoutePermissionMapping[] = [
  // Dashboard
  {
    pattern: /^\/dashboard(\/.*)?$/,
    permission: "dashboard.view",
    description: "Access to main dashboard",
  },

  // Finance section
  {
    pattern: /^\/finance\/invoices\/create(\/.*)?$/,
    permission: "finance.invoices.create",
    description: "Create new invoices",
  },
  {
    pattern: /^\/finance\/invoices\/edit(\/.*)?$/,
    permission: "finance.invoices.edit",
    description: "Edit existing invoices",
  },
  {
    pattern: /^\/finance\/invoices(\/.*)?$/,
    permission: "finance.invoices.view",
    description: "View invoices",
  },
  {
    pattern: /^\/finance\/orders\/create(\/.*)?$/,
    permission: "finance.orders.create",
    description: "Create new orders",
  },
  {
    pattern: /^\/finance\/orders(\/.*)?$/,
    permission: "finance.orders.view",
    description: "View orders",
  },
  {
    pattern: /^\/finance\/reports(\/.*)?$/,
    permission: "finance.reports.view",
    description: "View finance reports",
  },
  {
    pattern: /^\/finance(\/.*)?$/,
    permission: "finance.view",
    description: "Access finance section",
  },

  // Accounting section
  {
    pattern: /^\/accounting\/ledger\/entries\/create(\/.*)?$/,
    permission: "accounting.ledger.entries.create",
    description: "Create ledger entries",
  },
  {
    pattern: /^\/accounting\/ledger(\/.*)?$/,
    permission: "accounting.ledger.view",
    description: "View general ledger",
  },
  {
    pattern: /^\/accounting\/journals\/create(\/.*)?$/,
    permission: "accounting.journals.create",
    description: "Create journal entries",
  },
  {
    pattern: /^\/accounting\/journals(\/.*)?$/,
    permission: "accounting.journals.view",
    description: "View journal entries",
  },
  {
    pattern: /^\/accounting\/reports(\/.*)?$/,
    permission: "accounting.reports.view",
    description: "View accounting reports",
  },
  {
    pattern: /^\/accounting(\/.*)?$/,
    permission: "accounting.view",
    description: "Access accounting section",
  },

  // User management
  {
    pattern: /^\/users\/create(\/.*)?$/,
    permission: "users.create",
    description: "Create new users",
  },
  {
    pattern: /^\/users\/edit(\/.*)?$/,
    permission: "users.edit",
    description: "Edit existing users",
  },
  {
    pattern: /^\/users\/roles(\/.*)?$/,
    permission: "users.roles.manage",
    description: "Manage user roles",
  },
  {
    pattern: /^\/users(\/.*)?$/,
    permission: "users.view",
    description: "View users",
  },

  // Settings
  {
    pattern: /^\/settings\/system(\/.*)?$/,
    permission: "settings.system.manage",
    description: "Manage system settings",
  },
  {
    pattern: /^\/settings\/company(\/.*)?$/,
    permission: "settings.company.manage",
    description: "Manage company settings",
  },
  {
    pattern: /^\/settings(\/.*)?$/,
    permission: "settings.view",
    description: "Access settings",
  },

  // Reports (hierarchical structure)
  {
    pattern: /^\/reports\/finance\/orders(\/.*)?$/,
    permission: "reports.finance.orders.view",
    description: "View order reports",
  },
  {
    pattern: /^\/reports\/finance(\/.*)?$/,
    permission: "reports.finance.view",
    description: "View finance reports",
  },
  {
    pattern: /^\/reports(\/.*)?$/,
    permission: "reports.view",
    description: "Access reports section",
  },

  // Add more routes as your application grows...
];

/**
 * Function to determine the required permission for a given path
 * @param path The URL path to check
 * @returns The required permission string or null if no permission is required
 */
export function getRequiredPermission(path: string): string | null {
  // Check against each pattern in order (more specific routes first)
  for (const route of routePermissionMap) {
    if (route.pattern.test(path)) {
      return route.permission;
    }
  }
  return null; // No permission required for this path
}

/**
 * Get all available permissions from the route mapping
 * Useful for seeding the database or UI components that manage permissions
 */
export function getAllPermissionsFromRoutes(): {
  name: string;
  description?: string;
}[] {
  const uniquePermissions = new Map<string, string | undefined>();

  routePermissionMap.forEach((route) => {
    if (!uniquePermissions.has(route.permission)) {
      uniquePermissions.set(route.permission, route.description);
    }
  });

  return Array.from(uniquePermissions.entries()).map(([name, description]) => ({
    name,
    description,
  }));
}
