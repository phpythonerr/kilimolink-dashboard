import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
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
