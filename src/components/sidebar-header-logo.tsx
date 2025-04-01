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
  const { theme, resolvedTheme } = useTheme();
  const { open: isOpen } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = React.useMemo(() => {
    if (isOpen) {
      return resolvedTheme === "dark"
        ? "/img/logo/logo-white.svg"
        : "/img/logo/logo-primary.svg";
    }
    return resolvedTheme === "dark"
      ? "/img/logo/logo-symbol-white.svg"
      : "/img/logo/kilimolink-logo-symbol-green.svg";
  }, [resolvedTheme, isOpen]);

  // Handle initial loading state
  if (!mounted) {
    return null;
  }

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
              src={logoSrc}
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
