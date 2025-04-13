import { ReactNode, Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getUserPermissions } from "@/lib/permissions";
import { getRequiredPermissions } from "@/lib/permissions";
import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Mail, Bug } from "lucide-react";
import { ModeToggle } from "@/components/theme-mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  // Get the current session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Always get user permissions for the sidebar
  const userPermissions = await getUserPermissions(user.id);
  const permissionNames = userPermissions.map((p) => p.name);

  // Get the current path
  const pathname = new URL(headers().get("x-url") || "http://localhost/")
    .pathname;

  // Check if user has required permissions for this path
  const requiredPermissions = getRequiredPermissions(pathname);

  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissionNames.includes(permission)
    );

    if (!hasAllPermissions) {
      // Show 404 error for any page the user doesn't have permission to access
      notFound();
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} userPermissions={permissionNames} />
      <main className="h-screen w-full flex flex-col gap-4">
        <div className="h-12 px-4 flex items-center justify-between ">
          <SidebarTrigger className="cursor-pointer" />
          <div className="flex items-center gap-4">
            <ModeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Bug strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="text-lg">Report Bug</SheetTitle>
                  <SheetDescription>
                    Report bug feature comung soon
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-1 justify-center items-center">
                  <Bug strokeWidth={1} size={84} />
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button disabled={true} type="submit">
                      Report
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}

// Helper function to get headers in Server Components
function headers() {
  return new Headers(
    // @ts-ignore
    Object.fromEntries(Object.entries(require("next/headers").headers() || {}))
  );
}
