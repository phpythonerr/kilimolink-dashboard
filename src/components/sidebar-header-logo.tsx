"use client";

import * as React from "react";
import Image from "next/image";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useTheme } from "next-themes";

export function SidebarHeaderLogo() {
  const { theme } = useTheme();
  const { open: isOpen } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Link href="/">
            <Image
              width={Boolean(isOpen) ? 133 : 30}
              height={30}
              src={
                Boolean(isOpen)
                  ? "/img/logo/logo-primary.svg"
                  : "/img/logo/kilimolink-logo-symbol-green.svg"
              }
              alt="Kilimolink"
              priority
              className=""
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
