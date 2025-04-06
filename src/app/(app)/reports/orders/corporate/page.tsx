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
    .select("unit_price, quantity, payment_status, paid_amount, balance")
    .neq("payment_status", "Paid");

  let { data: orders, error: orderError } = await supabase
    .from("orders_order")
    .select("total, payment_status")
    .neq("payment_status", "Paid");

  // Calculate total unpaid amount for purchases
  const totalUnpaidPurchases = (purchases || []).reduce((acc, purchase) => {
    if (purchase.payment_status === "Partially-Paid") {
      return acc + (purchase.balance || 0);
    } else {
      return acc + purchase.unit_price * purchase.quantity;
    }
  }, 0);

  // Calculate total unpaid amount for orders
  const totalUnpaidOrders = (orders || []).reduce((acc, order) => {
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
                  Ksh.{totalUnpaidOrders.toLocaleString()}
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
                <CardDescription>Unpaid Purchases</CardDescription>
                <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                  Ksh.{totalUnpaidPurchases.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="text-muted-foreground">
                  {" "}
                  {purchases?.length || 0} unpaid purchases
                </div>
              </CardFooter>
            </Card>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
