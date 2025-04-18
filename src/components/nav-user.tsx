"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/auth/login/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface NavUserProps {
  user: UserProfile;
}

export function NavUser({ user }: NavUserProps) {
  const { push } = useRouter();
  const { isMobile } = useSidebar();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSignOut = async () => {
    if (submitting) return;

    setSubmitting(true);

    await toast.promise(signOut(), {
      loading: "Logging out...",
      success: (res: any) => {
        if (res.success) {
          push(res.redirect);
          return res.message;
        }
        return new Error(res.error || "Failed to log out");
      },
      error: (err: any) => {
        return err instanceof Error ? err.message : "An error occurred";
      },
      finally: () => {
        setSubmitting(false);
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg">
                  {`${user?.name?.charAt(0).toUpperCase()}`}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-lg">{`${user?.name
                    ?.charAt(0)
                    .toUpperCase()}`}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {`${user?.name}`}
                  </span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="https://www.kilimolink.com/app/staff"
                  target="_blank"
                >
                  <div className="flex flex-1 items-center gap-2">
                    <RefreshCw />
                    Switch to Old Version
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">
                  <div className="flex flex-1 items-center gap-2">
                    <BadgeCheck />
                    Account
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">
                  <div className="flex flex-1 items-center gap-2">
                    <Bell />
                    Notifications
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                className="w-full flex"
                variant="ghost"
                onClick={() => handleSignOut()}
              >
                <div className="flex flex-1 items-center gap-2">
                  <LogOut />
                  {submitting ? "Signing out..." : "Log out"}
                </div>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
