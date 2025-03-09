import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import type { Metadata } from "next";
import Menu from "./menu";

export const metadata: Metadata = {
  title: "Summary | Corporate Order Reports",
  description: "",
};

export default async function Page() {
  return (
    <div className="p-4">
      <div>
        <Menu active="summary" />
      </div>
    </div>
  );
}
