import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "View Order",
  description: "",
};

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: any) {
  const { id } = await searchParams;

  return (
    <div className="p-4">
      <Tabs defaultValue="details" className="w-[350px]">
        <TabsList className="w-full">
          <TabsTrigger value="details" asChild>
            <Link href={`/orders/corporate/view?id=${id}`}>Order Details</Link>
          </TabsTrigger>
          <TabsTrigger value="items" asChild>
            <Link href={`/orders/corporate/view/items?id=${id}`}>Items</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="py-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Under Development</AlertTitle>
          <AlertDescription>
            Order Items are available under the 'Items' Tab
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
