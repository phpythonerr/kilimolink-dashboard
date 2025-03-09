"use client";

import * as React from "react";
import Image from "next/image";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

export function SidebarHeaderLogo() {
  const { theme } = useTheme();
  console.log(theme);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Image
            width={133}
            height={30}
            // src={
            //   theme === "light" || theme === "undefined"
            //     ? "/img/logo/logo-primary.svg"
            //     : "/img/logo/logo-white-primary.svg"
            // }
            src="/img/logo/logo-primary.svg"
            alt="Kilimolink"
            priority
            className=""
          />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
