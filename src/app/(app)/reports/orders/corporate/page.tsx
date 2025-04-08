import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";
import Menu from "./menu";

export const metadata: Metadata = {
  title: "Summary | Corporate Order Reports",
  description: "",
};

export default async function Page() {
  const supabase = await createClient();

  let { data: purchases, error: purchasesError } = await supabase
    .from("inventory_purchases")
    .select("unit_price, quantity, payment_status, paid_amount, balance");

  let { data: orders, error: orderError } = await supabase
    .from("orders_order")
    .select("total, payment_status")
    .eq("payment_status", "Unpaid");

  const paidPurchases = purchases?.filter(
    (purchase: any) => purchase?.payment_status === "Paid"
  );

  const unpaidPurchases = purchases?.filter(
    (purchase: any) =>
      purchase?.payment_status === "Unpaid" ||
      purchase?.payment_status === "Partially-Paid"
  );

  // Calculate total unpaid amount for purchases
  const totalUnpaidPurchases = (purchases || []).reduce(
    (acc: any, purchase: any) => {
      if (purchase?.payment_status === "Partially-Paid") {
        return acc + (purchase?.balance || 0);
      } else if (purchase?.payment_status === "Unpaid") {
        return acc + purchase.unit_price * purchase?.quantity;
      }
      return acc;
    },
    0
  );

  // Calculate total paid amount for purchases
  const totalPaidPurchases = (purchases || []).reduce(
    (acc: any, purchase: any) => {
      if (purchase?.payment_status === "Paid") {
        return acc + purchase?.unit_price * purchase?.quantity;
      } else if (purchase?.payment_status === "Partially-Paid") {
        return acc + (purchase?.paid_amount || 0);
      }
      return acc;
    },
    0
  );

  // Calculate total unpaid amount for orders
  const totalUnpaidOrders = (orders || []).reduce((acc: any, order: any) => {
    return acc + (order.total || 0);
  }, 0);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <Menu active="summary" />
      </div>
      <div>
        <Suspense fallback={`Loading`}>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="@container/card">
              <CardHeader className="relative">
                <CardDescription>Unpaid Orders</CardDescription>
                <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                  Ksh.{Number(totalUnpaidOrders).toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="text-muted-foreground">
                  {orders?.length || 0} unpaid orders
                </div>
              </CardFooter>
            </Card>
            <Card className="@container/card">
              <CardHeader className="relative">
                <CardDescription>Paid Purchases</CardDescription>
                <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                  Ksh.{Number(totalPaidPurchases).toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="text-muted-foreground">
                  {paidPurchases?.length || 0} paid purchases
                </div>
              </CardFooter>
            </Card>
            <Card className="@container/card">
              <CardHeader className="relative">
                <CardDescription>Unpaid Purchases</CardDescription>
                <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                  Ksh.{totalUnpaidPurchases.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="text-muted-foreground">
                  {unpaidPurchases?.length || 0} unpaid purchases
                </div>
              </CardFooter>
            </Card>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
