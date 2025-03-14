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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

// Updated interfaces
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

// Update user interface to match NavUser component requirements
interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface SidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: Partial<UserProfile>;
}

// ...existing navData array...

export function AppSidebar({ user, ...props }: SidebarProps) {
  // Transform user data to match NavUser requirements
  const userProfile: UserProfile = {
    name: user?.name || "Guest User",
    email: user?.email || "guest@example.com",
    avatar: user?.image || "/default-avatar.png",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Quick Actions" asChild>
              <Link href="/">
                <CircleGauge />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {navData.map((nav, index) => (
          <NavItem key={index} title={nav.title} items={nav.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userProfile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
