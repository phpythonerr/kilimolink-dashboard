// Define a more comprehensive permission structure
// This maps routes to required permissions
export const PERMISSION_MAP = {
  // Root path
  "/auth/login": { permissions: [], redirectPath: "/unauthorized" },

  // Admin routes
  "/admin": { permissions: ["admin.access"], redirectPath: "/unauthorized" },
  "/admin/users": { permissions: ["admin.users.view"], redirectPath: "/admin" },
  "/admin/users/edit": {
    permissions: ["admin.users.edit"],
    redirectPath: "/admin/users",
  },

  // Orders routes
  "/orders/corporate/new": {
    permissions: ["orders.corporate.create"],
    redirectPath: "/unauthorized",
  },
  "/orders/corporate": {
    permissions: ["orders.corporate.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/corporate/by-day": {
    permissions: ["orders.corporate.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/corporate/upcoming": {
    permissions: ["orders.corporate.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/corporate/[id]/items": {
    permissions: ["orders.corporate.single.items.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/corporate/[id]/edit": {
    permissions: ["orders.corporate.single.edit"],
    redirectPath: "/unauthorized",
  },
  "/orders/corporate/[id]/delete": {
    permissions: ["orders.corporate.single.delete"],
    redirectPath: "/unauthorized",
  },
  "/orders/corporate/[id]": {
    permissions: ["orders.corporate.single.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/vendors/new": {
    permissions: ["orders.vendors.create"],
    redirectPath: "/unauthorized",
  },
  "/orders/vendors": {
    permissions: ["orders.vendors.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/vendors/by-day": {
    permissions: ["orders.vendors.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/vendors/upcoming": {
    permissions: ["orders.vendors.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/vendors/[id]/items": {
    permissions: ["orders.vendors.single.items.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/vendors/[id]/edit": {
    permissions: ["orders.vendors.single.edit"],
    redirectPath: "/unauthorized",
  },
  "/orders/vendors/[id]/delete": {
    permissions: ["orders.vendors.single.delete"],
    redirectPath: "/unauthorized",
  },
  "/orders/vendors/[id]": {
    permissions: ["orders.vendors.single.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/individual/new": {
    permissions: ["orders.individual.create"],
    redirectPath: "/unauthorized",
  },
  "/orders/individual": {
    permissions: ["orders.individual.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/individual/by-day": {
    permissions: ["orders.individual.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/individual/upcoming": {
    permissions: ["orders.individual.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/individual/[id]/items": {
    permissions: ["orders.individual.single.items.view"],
    redirectPath: "/unauthorized",
  },
  "/orders/individual/[id]/edit": {
    permissions: ["orders.individual.single.edit"],
    redirectPath: "/unauthorized",
  },
  "/orders/individual/[id]/delete": {
    permissions: ["orders.individual.single.delete"],
    redirectPath: "/unauthorized",
  },
  "/orders/individual/[id]": {
    permissions: ["orders.individual.single.view"],
    redirectPath: "/unauthorized",
  },

  // Accounting routes
  "/accounting/expenses": {
    permissions: ["accounting.expenses.view"],
    redirectPath: "/unauthorized",
  },
  "/accounting/expenses/purchases": {
    permissions: ["accounting.expenses.purchases.view"],
    redirectPath: "/unauthorized",
  },
  "/accounting/expenses/other": {
    permissions: ["accounting.expenses.other.view"],
    redirectPath: "/unauthorized",
  },
  "/accounting/revenues": {
    permissions: ["accounting.revenues.view"],
    redirectPath: "/unauthorized",
  },
  "/accounting/payments": {
    permissions: ["accounting.payments.view"],
    redirectPath: "/unauthorized",
  },

  // Reports routes
  "/reports/orders/corporate": {
    permissions: ["reports.orders.corporate.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/orders/vendors": {
    permissions: ["reports.orders.vendors.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/orders/individual": {
    permissions: ["reports.orders.individual.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/accounting/expenses": {
    permissions: ["reports.accounting.expenses.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/accounting/revenues": {
    permissions: ["reports.accounting.revenues.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/accounting/profit-loss": {
    permissions: ["reports.accounting.profit-loss.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/accounting/balance-sheet": {
    permissions: ["reports.accounting.balance-sheet.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/accounting/statement-of-accounts": {
    permissions: ["reports.accounting.statements.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/products": {
    permissions: ["reports.products.view"],
    redirectPath: "/unauthorized",
  },
  "/reports/logistics/vehicles": {
    permissions: ["reports.logistics.vehicles.view"],
    redirectPath: "/unauthorized",
  },

  // HR Routes
  "/hr/employees/active": {
    permissions: ["hr.employees.active.view"],
    redirectPath: "/unauthorized",
  },
  "/hr/employees/inactive": {
    permissions: ["hr.employees.inactive.view"],
    redirectPath: "/unauthorized",
  },
  "/hr/employees/new": {
    permissions: ["hr.employees.create"],
    redirectPath: "/unauthorized",
  },
  "/hr/employees/edit": {
    permissions: ["hr.employees.edit"],
    redirectPath: "/unauthorized",
  },
  "/hr/employees/working-hours": {
    permissions: ["hr.employees.working-hours.view"],
    redirectPath: "/unauthorized",
  },
  "/hr/payroll": {
    permissions: ["hr.payroll.view"],
    redirectPath: "/unauthorized",
  },

  // Logistics routes
  "/logistics/vehicles": {
    permissions: ["logistics.vehicles.view"],
    redirectPath: "/unauthorized",
  },

  // Store routes
  "/store/inventory": {
    permissions: ["store.inventory.view"],
    redirectPath: "/unauthorized",
  },
  "/store/inventory/[id]/ledger": {
    permissions: ["store.inventory.ledger.view"],
    redirectPath: "/unauthorized",
  },
  "/store/sales/record": {
    permissions: ["store.sales.create"],
    redirectPath: "/unauthorized",
  },
  "/store/products": {
    permissions: ["store.products.view"],
    redirectPath: "/unauthorized",
  },
  "/store/products/categories": {
    permissions: ["store.products.categories.view"],
    redirectPath: "/unauthorized",
  },
  "/store/pricelists": {
    permissions: ["store.pricelists.view"],
    redirectPath: "/unauthorized",
  },
  "/store/sourcing/farmers": {
    permissions: ["store.sourcing.farmers.view"],
    redirectPath: "/unauthorized",
  },
  "/store/sourcing/farms": {
    permissions: ["store.sourcing.farms.view"],
    redirectPath: "/unauthorized",
  },
  "/store/sourcing/farms/map": {
    permissions: ["store.sourcing.farms.map.view"],
    redirectPath: "/unauthorized",
  },

  // Users routes
  "/users/customers/corporate": {
    permissions: ["users.customers.corporate.view"],
    redirectPath: "/unauthorized",
  },
  "/users/vendors": {
    permissions: ["users.sellers.vendors.view"],
    redirectPath: "/unauthorized",
  },
  "/users/farmers": {
    permissions: ["users.sellers.farmers.view"],
    redirectPath: "/unauthorized",
  },
  "/users/staff": {
    permissions: ["users.staff.view"],
    redirectPath: "/unauthorized",
  },
};
