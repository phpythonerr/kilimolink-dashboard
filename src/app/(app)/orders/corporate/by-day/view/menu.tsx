import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function Menu({ active, date }: any) {
  return (
    <div className="p-4">
      <Tabs defaultValue={active} className="w-auto">
        <TabsList className="w-full">
          <TabsTrigger value="orders" asChild>
            <Link href={`/orders/corporate/by-day/view?date=${date}`}>
              Day Orders
            </Link>
          </TabsTrigger>
          <TabsTrigger value="cog" asChild>
            <Link href={`/orders/corporate/by-day/view/cog?date=${date}`}>
              Day Cost of Goods
            </Link>
          </TabsTrigger>
          {/* <TabsTrigger value="expenses" asChild>
            <Link href={`/orders/corporate/by-day/view/expenses?date=${date}`}>
              Expenses
            </Link>
          </TabsTrigger> */}
          <TabsTrigger value="report" asChild>
            <Link href={`/orders/corporate/by-day/view/report?date=${date}`}>
              Day Report
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
