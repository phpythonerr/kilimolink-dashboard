// config/navigation.ts
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
} from "lucide-react";
import { NavItem } from "@/lib/permissions";

export const navigationItems: NavItem[] = [
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
            permission: "orders.corporate.all.view",
          },
          {
            title: "Orders By Day",
            url: "/orders/corporate/by-day",
            permission: "orders.corporate.by-day.view",
          },
          {
            title: "Upcoming Orders",
            url: "/orders/corporate/upcoming",
            permission: "orders.corporate.upcoming.view",
          },
          {
            title: "Upcoming Orders",
            url: "/orders/corporate/view",
            permission: "orders.corporate.single.view",
          },
        ],
      },
      {
        title: "Vendor Orders",
        url: "#",
        icon: Store,
        items: [
          {
            title: "All Orders",
            url: "/orders/vendors",
          },
          {
            title: "Orders By Day",
            url: "/orders/vendors/by-day",
          },
          {
            title: "Upcoming Orders",
            url: "/orders/vendors/upcoming",
          },
        ],
      },
      {
        title: "Individual Orders",
        url: "#",
        icon: User,
        items: [
          {
            title: "All Orders",
            url: "/orders/individuals",
          },
          {
            title: "Orders By Day",
            url: "/orders/individuals/by-day",
          },
          {
            title: "Upcoming Orders",
            url: "/orders/individuals/upcoming",
          },
        ],
      },
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
          {
            title: "Vendors",
            url: "/reports/orders/vendors",
          },
          {
            title: "Individuals",
            url: "/reports/orders/individuals",
          },
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
            url: "/store/products/all",
          },
          {
            title: "Pricelists",
            url: "/store/products/pricelists",
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
          {
            title: "Vendor Customers",
            url: "/users/customers/vendors",
          },
          {
            title: "Individual Customers",
            url: "/users/customers/individual",
          },
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
