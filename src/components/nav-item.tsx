"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface NavSubItem {
  title: string;
  url: string;
  permission?: string;
}

interface NavItemProps {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    permission?: string;
    items?: NavSubItem[];
  }[];
  title: string;
  userPermissions?: string[];
}

export function NavItem({ items, title, userPermissions = [] }: NavItemProps) {
  // Filter items based on permissions AND ensure each item has at least one accessible sub-item
  const filteredItems = items.filter((item: any) => {
    // For items with subitems, check if the user has explicit permission for any subitem
    if (item.items && item.items.length > 0) {
      const accessibleSubItems = item.items.filter(
        (subItem: any) =>
          subItem.permission && userPermissions.includes(subItem.permission)
      );

      // If any subitems are accessible with explicit permissions, show this item
      return accessibleSubItems.length > 0;
    }

    // For items without subitems, check if they have explicit permission
    const hasItemPermission =
      item.permission && userPermissions.includes(item.permission);

    return hasItemPermission;
  });

  // If there are no items to display after filtering, don't show the section
  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item: any) => {
          // Filter sub-items based on explicit permissions only
          const filteredSubItems = item.items?.filter(
            (subItem: any) =>
              subItem.permission && userPermissions.includes(subItem.permission)
          );

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible cursor-pointer"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="cursor-pointer"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {filteredSubItems?.map((subItem: any) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
