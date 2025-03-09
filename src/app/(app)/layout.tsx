import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, Mail } from "lucide-react";
import { ModeToggle } from "@/components/theme-mode-toggle";
import { getUser } from "@/data/users";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="h-screen w-full flex flex-col gap-4">
        <div className="h-12 px-4 flex items-center justify-between ">
          <SidebarTrigger className="cursor-pointer" />
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
