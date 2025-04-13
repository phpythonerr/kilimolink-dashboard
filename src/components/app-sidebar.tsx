"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
  Store,
  Building2,
  ChartArea,
  CircleGauge,
  Users,
  List,
  ScrollText,
  ChartBar,
  ChartNoAxesCombined,
  Truck,
  FolderOutput,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { hasPermissionForSection } from "@/lib/permissions-ui";

import { NavQuickActions } from "@/components/nav-quick-actions";
import { NavUser } from "@/components/nav-user";
import { NavItem } from "@/components/nav-item";
import { SidebarHeaderLogo } from "@/components/sidebar-header-logo";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

interface NavSubItem {
  title: string;
  url: string;
  permission?: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  permission?: string;
  items?: NavSubItem[];
}

interface NavSection {
  title: string;
  permission?: string; // Permission required to see the entire section
  items: NavItem[];
}

const navData: NavSection[] = [
  {
    title: "Orders",
    permission: "orders.view",
    items: [
      {
        title: "Corporate Orders",
        url: "#",
        icon: Building2,
        isActive: false,
        permission: "orders.corporate.view",
        items: [
          {
            title: "All Orders",
            url: "/orders/corporate",
            permission: "orders.corporate.view",
          },
          {
            title: "Orders By Day",
            url: "/orders/corporate/by-day",
            permission: "orders.corporate.view",
          },
          {
            title: "Upcoming Orders",
            url: "/orders/corporate/upcoming",
            permission: "orders.corporate.view",
          },
        ],
      },
      // {
      //   title: "Vendor Orders",
      //   url: "#",
      //   icon: Store,
      //   permission: "orders.vendors.view",
      //   items: [
      //     {
      //       title: "All Orders",
      //       url: "/orders/vendors",
      //       permission: "orders.vendors.view",
      //     },
      //     {
      //       title: "Orders By Day",
      //       url: "/orders/vendors/by-day",
      //       permission: "orders.vendors.view",
      //     },
      //     {
      //       title: "Upcoming Orders",
      //       url: "/orders/vendors/upcoming",
      //       permission: "orders.vendors.view",
      //     },
      //   ],
      // },
      // {
      //   title: "Individual Orders",
      //   url: "#",
      //   icon: User,
      //   permission: "orders.individual.view",
      //   items: [
      //     {
      //       title: "All Orders",
      //       url: "/orders/individuals",
      //       permission: "orders.individual.view",
      //     },
      //     {
      //       title: "Orders By Day",
      //       url: "/orders/individuals/by-day",
      //       permission: "orders.individual.view",
      //     },
      //     {
      //       title: "Upcoming Orders",
      //       url: "/orders/individuals/upcoming",
      //       permission: "orders.individual.view",
      //     },
      //   ],
      // },
    ],
  },
  {
    title: "Accounting",
    permission: "accounting.view",
    items: [
      {
        title: "Expenses",
        url: "#",
        icon: SquareTerminal,
        isActive: false,
        permission: "accounting.expenses.view",
        items: [
          {
            title: "Purchases",
            url: "/accounting/expenses/purchases",
            permission: "accounting.expenses.purchases.view",
          },
          {
            title: "Other Expenses",
            url: "/accounting/expenses/other",
            permission: "accounting.expenses.other.view",
          },
        ],
      },
      {
        title: "Revenues",
        url: "#",
        icon: Bot,
        permission: "accounting.revenues.view",
        items: [
          {
            title: "Other Revenues",
            url: "/accounting/revenues",
            permission: "accounting.revenues.view",
          },
        ],
      },
      {
        title: "Payments",
        url: "#",
        icon: FolderOutput,
        permission: "accounting.payments.view",
        items: [
          {
            title: "All Payments",
            url: "/accounting/payments",
            permission: "accounting.payments.view",
          },
        ],
      },
    ],
  },
  {
    title: "Logistics",
    permission: "logistics.view", // Added permission
    items: [
      {
        title: "Vehicles",
        url: "#",
        icon: Truck,
        isActive: false,
        permission: "logistics.vehicles.view", // Added specific permission
        items: [
          {
            title: "Vehicles",
            url: "/logistics/vehicles",
            permission: "logistics.vehicles.view", // Added specific permission
          },
        ],
      },
    ],
  },
  {
    title: "Reports",
    permission: "reports.view", // Added permission
    items: [
      {
        title: "Orders",
        url: "#",
        icon: ChartNoAxesCombined,
        isActive: false,
        permission: "reports.orders.view", // Added specific permission
        items: [
          {
            title: "Corporate",
            url: "/reports/orders/corporate",
            permission: "reports.orders.corporate.view", // Added specific permission
          },
          // {
          //   title: "Vendors",
          //   url: "/reports/orders/vendors",
          // },
          // {
          //   title: "Individuals",
          //   url: "/reports/orders/individuals",
          // },
        ],
      },
      {
        title: "Products",
        url: "#",
        icon: ChartBar,
        permission: "reports.products.view", // Added specific permission
        items: [
          {
            title: "All Reports",
            url: "/reports/products",
            permission: "reports.products.view", // Added specific permission
          },
        ],
      },
      {
        title: "Accounting",
        url: "#",
        icon: ChartArea,
        permission: "reports.accounting.view", // Added specific permission
        items: [
          {
            title: "Expenses",
            url: "/reports/accounting/expenses",
            permission: "reports.accounting.expenses.view", // Added specific permission
          },
          {
            title: "Revenues",
            url: "/reports/accounting/revenues",
            permission: "reports.accounting.revenues.view", // Added specific permission
          },
          {
            title: "Balance Sheet",
            url: "/reports/accounting/balance-sheet",
            permission: "reports.accounting.balance-sheet.view", // Added specific permission
          },
          {
            title: "Profit & Loss",
            url: "/reports/accounting/profit-loss",
            permission: "reports.accounting.profit-loss.view", // Added specific permission
          },
          {
            title: "Statements of Accounts",
            url: "#",
            permission: "reports.accounting.statements.view", // Added specific permission
          },
        ],
      },
      {
        title: "Logistics",
        url: "#",
        icon: ChartBar,
        permission: "reports.logistics.view", // Added specific permission
        items: [
          {
            title: "Vehicles",
            url: "/reports/logistics/vehicles",
            permission: "reports.logistics.vehicles.view", // Added specific permission
          },
          // {
          //   title: "Fuel",
          //   url: "/reports/logistics/fuel",
          // },
        ],
      },
    ],
  },
  {
    title: "Store",
    permission: "store.view", // Added permission
    items: [
      {
        title: "Inventory",
        url: "#",
        icon: List,
        isActive: false,
        permission: "store.inventory.view", // Added specific permission
        items: [
          {
            title: "Inventory",
            url: "/store/inventory",
            permission: "store.inventory.view", // Added specific permission
          },
        ],
      },
      {
        title: "Sales",
        url: "#",
        icon: Bot,
        permission: "store.sales.view", // Added specific permission
        items: [
          {
            title: "Record Sales",
            url: "/store/sales/record",
            permission: "store.sales.create", // Added specific permission
          },
        ],
      },
      {
        title: "Products",
        url: "#",
        icon: Bot,
        permission: "store.products.view", // Added specific permission
        items: [
          {
            title: "Categories",
            url: "/store/products/categories",
            permission: "store.products.categories.view", // Added specific permission
          },
          {
            title: "Product List",
            url: "/store/products",
            permission: "store.products.view", // Added specific permission
          },
          {
            title: "Pricelists",
            url: "/store/pricelists",
            permission: "store.pricelists.view", // Added specific permission
          },
        ],
      },
    ],
  },
  {
    title: "Human Resource",
    permission: "hr.view", // Added permission
    items: [
      {
        title: "Employees",
        url: "#",
        icon: Users,
        isActive: false,
        permission: "hr.employees.view", // Added specific permission
        items: [
          {
            title: "Employee List",
            url: "/hr/employees/active",
            permission: "hr.employees.active.view", // Added specific permission
          },
          {
            title: "Working Hours",
            url: "/hr/employees/working-hours",
            permission: "hr.employees.working-hours.view", // Added specific permission
          },
        ],
      },
      {
        title: "Payroll",
        url: "#",
        icon: ScrollText,
        isActive: false,
        permission: "hr.payroll.view", // Added specific permission
        items: [
          {
            title: "Payroll",
            url: "/hr/payroll",
            permission: "hr.payroll.view", // Added specific permission
          },
        ],
      },
    ],
  },
  {
    title: "Users",
    permission: "users.view", // Added permission
    items: [
      {
        title: "Customers",
        url: "#",
        icon: Users,
        isActive: false,
        permission: "users.customers.view", // Added specific permission
        items: [
          {
            title: "Corporate Customers",
            url: "/users/customers/corporate",
            permission: "users.customers.corporate.view", // Added specific permission
          },
          // {
          //   title: "Vendor Customers",
          //   url: "/users/customers/vendors",
          // },
          // {
          //   title: "Individual Customers",
          //   url: "/users/customers/individual",
          // },
        ],
      },
      {
        title: "Sellers",
        url: "#",
        icon: ScrollText,
        isActive: false,
        permission: "users.sellers.view", // Added specific permission
        items: [
          {
            title: "Vendors",
            url: "/users/vendors",
            permission: "users.sellers.vendors.view", // Added specific permission
          },
          {
            title: "Farmers",
            url: "/users/farmers",
            permission: "users.sellers.farmers.view", // Added specific permission
          },
        ],
      },
    ],
  },
];

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface UserMetadata {
  first_name?: string;
  last_name?: string;
  business_name?: string;
  avatar?: string;
}

interface SidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    email?: string;
    id?: string;
    user_metadata?: UserMetadata;
  };
  userPermissions?: any[]; // Can be string[] or Permission[] objects
}

export function AppSidebar({
  user,
  userPermissions = [],
  ...props
}: SidebarProps) {
  const userProfile: UserProfile = {
    name:
      (`${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}` ||
        user?.user_metadata?.business_name) ??
      "Guest User",
    email: user?.email ?? "",
    avatar: user?.user_metadata?.avatar ?? "/img/default-avatar.png",
  };

  // Show unconditional menu items
  const dashboardMenuItem = (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Dashboard" asChild>
        <Link href="/dashboard">
          <CircleGauge />
          <span>Dashboard</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  // Show admin access only if user has that permission
  const adminMenuItem = userPermissions.includes("admin.access") ? (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Admin" asChild>
        <Link href="/admin">
          <Shield />
          <span>Admin</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ) : null;

  // Helper function to check if user has any permission within a section
  const hasAnySectionPermission = (section: NavSection): boolean => {
    // First check if any items or subitems have explicit permissions that the user has
    const hasAnyExplicitPermission = section.items.some((item: any) => {
      // Check direct item permission if it's defined
      const hasExplicitItemPermission =
        item.permission && userPermissions.includes(item.permission);

      // If there are sub-items, check if any have explicit permissions
      if (item.items && item.items.length > 0) {
        const hasExplicitSubItemPermission = item.items.some(
          (subItem: any) =>
            subItem.permission && userPermissions.includes(subItem.permission)
        );
        return hasExplicitItemPermission || hasExplicitSubItemPermission;
      }

      return hasExplicitItemPermission;
    });

    // Only show sections where the user has at least one explicit permission
    return hasAnyExplicitPermission;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {dashboardMenuItem}
          {adminMenuItem}
        </SidebarMenu>

        {navData.map((section, index) => {
          // Instead of checking for section permission, check if the user has ANY
          // permission for items within this section
          const hasSectionAccess = hasAnySectionPermission(section);

          // Skip if user has no access to any item in the section
          if (!hasSectionAccess) {
            return null;
          }

          return (
            <NavItem
              title={section.title}
              items={section.items}
              key={index}
              userPermissions={userPermissions}
            />
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
