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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
// import { getAuthorizedNavItems } from "@/lib/permissions";

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
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navData: NavSection[] = [
  {
    title: "Orders",
    items: [
      {
        title: "Corporate Orders",
        url: "#",
        icon: Building2,
        isActive: false,
        items: [
          {
            title: "All Orders",
            url: "/orders/corporate",
          },
          {
            title: "Orders By Day",
            url: "/orders/corporate/by-day",
          },
          {
            title: "Upcoming Orders",
            url: "/orders/corporate/upcoming",
          },
        ],
      },
      // {
      //   title: "Vendor Orders",
      //   url: "#",
      //   icon: Store,
      //   items: [
      //     {
      //       title: "All Orders",
      //       url: "/orders/vendors",
      //     },
      //     {
      //       title: "Orders By Day",
      //       url: "/orders/vendors/by-day",
      //     },
      //     {
      //       title: "Upcoming Orders",
      //       url: "/orders/vendors/upcoming",
      //     },
      //   ],
      // },
      // {
      //   title: "Individual Orders",
      //   url: "#",
      //   icon: User,
      //   items: [
      //     {
      //       title: "All Orders",
      //       url: "/orders/individuals",
      //     },
      //     {
      //       title: "Orders By Day",
      //       url: "/orders/individuals/by-day",
      //     },
      //     {
      //       title: "Upcoming Orders",
      //       url: "/orders/individuals/upcoming",
      //     },
      //   ],
      // },
    ],
  },
  {
    title: "Accounting",
    items: [
      {
        title: "Expenses",
        url: "#",
        icon: SquareTerminal,
        isActive: false,
        items: [
          {
            title: "Purchases",
            url: "/accounting/expenses/purchases",
          },
          {
            title: "Other Expenses",
            url: "/accounting/expenses/other",
          },
        ],
      },
      {
        title: "Revenues",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Other Revenues",
            url: "/accounting/revenues",
          },
        ],
      },
      {
        title: "Payments",
        url: "#",
        icon: FolderOutput,
        items: [
          {
            title: "All Payments",
            url: "/accounting/payments",
          },
        ],
      },
    ],
  },
  {
    title: "Logistics",
    items: [
      {
        title: "Vehicles",
        url: "#",
        icon: Truck,
        isActive: false,
        items: [
          {
            title: "Vehicles",
            url: "/logistics/vehicles",
          },
        ],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Orders",
        url: "#",
        icon: ChartNoAxesCombined,
        isActive: false,
        items: [
          {
            title: "Corporate",
            url: "/reports/orders/corporate",
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
        items: [
          {
            title: "All Reports",
            url: "/reports/products",
          },
        ],
      },
      {
        title: "Accounting",
        url: "#",
        icon: ChartArea,
        items: [
          {
            title: "Expenses",
            url: "/reports/accounting/expenses",
          },
          {
            title: "Revenues",
            url: "/reports/accounting/revenues",
          },
          {
            title: "Balance Sheet",
            url: "/reports/accounting/balance-sheet",
          },
          {
            title: "Profit & Loss",
            url: "/reports/accounting/profit-loss",
          },
          {
            title: "Statements of Accounts",
            url: "#",
          },
        ],
      },
      {
        title: "Logistics",
        url: "#",
        icon: ChartBar,
        items: [
          {
            title: "Vehicles",
            url: "/reports/logistics/vehicles",
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
    items: [
      {
        title: "Inventory",
        url: "#",
        icon: List,
        isActive: false,
        items: [
          {
            title: "Inventory",
            url: "/store/inventory",
          },
        ],
      },
      {
        title: "Sales",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Record Sales",
            url: "/store/sales/record",
          },
        ],
      },
      {
        title: "Products",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Categories",
            url: "/store/products/categories",
          },
          {
            title: "Product List",
            url: "/store/products",
          },
          {
            title: "Pricelists",
            url: "/store/pricelists",
          },
        ],
      },
    ],
  },
  {
    title: "Human Resource",
    items: [
      {
        title: "Employees",
        url: "#",
        icon: Users,
        isActive: false,
        items: [
          {
            title: "Employee List",
            url: "/hr/employees/active",
          },
          {
            title: "Working Hours",
            url: "/hr/employees/working-hours",
          },
        ],
      },
      {
        title: "Payroll",
        url: "#",
        icon: ScrollText,
        isActive: false,
        items: [
          {
            title: "Payroll",
            url: "/hr/payroll",
          },
        ],
      },
    ],
  },
  {
    title: "Users",
    items: [
      {
        title: "Customers",
        url: "#",
        icon: Users,
        isActive: false,
        items: [
          {
            title: "Corporate Customers",
            url: "/users/customers/corporate",
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
        items: [
          {
            title: "Vendors",
            url: "/users/vendors",
          },
          {
            title: "Farmers",
            url: "/users/farmers",
          },
        ],
      },
      {
        title: "Staff",
        url: "#",
        icon: ScrollText,
        isActive: false,
        items: [
          {
            title: "All Staff",
            url: "/users/staff",
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
    user_metadata?: UserMetadata;
  };
}

export function AppSidebar({ user, ...props }: SidebarProps) {
  const userProfile: UserProfile = {
    name:
      (`${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}` ||
        user?.user_metadata?.business_name) ??
      "Guest User",
    email: user?.email ?? "",
    avatar: user?.user_metadata?.avatar ?? "/img/default-avatar.png",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavQuickActions teams={data.teams} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Quick Actions" asChild>
              <Link href="/dashboard">
                <CircleGauge />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {navData.map((nav, index) => (
          <NavItem title={nav.title} items={nav.items} key={index} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
