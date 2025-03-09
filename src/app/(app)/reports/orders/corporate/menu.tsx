import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function Menu({ active }) {
  return (
    <div className="p-4">
      <Tabs defaultValue={active} className="w-auto">
        <TabsList className="w-full">
          <TabsTrigger value="summary" asChild>
            <Link href={`/reports/orders/corporate/`}>Summary</Link>
          </TabsTrigger>
          <TabsTrigger value="weekly" asChild>
            <Link href={`/reports/orders/corporate/weekly`}>Weekly</Link>
          </TabsTrigger>
          <TabsTrigger value="monthly" asChild>
            <Link href={`/reports/orders/corporate/monthly`}>Monthly</Link>
          </TabsTrigger>
          <TabsTrigger value="per-customer" asChild>
            <Link href={`/reports/orders/corporate/per-customer`}>
              Per Customer
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
