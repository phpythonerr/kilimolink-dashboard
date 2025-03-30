import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Page() {
  const supabase = await createClient();

  let { data: orderItemsSumSale, error: orderItemsSumSaleError }: any =
    await supabase.rpc("get_total_revenue_on_goods");

  let { data: revenue, error: revenueError }: any = await supabase
    .from("finance_revenue")
    .select("amount");

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Total Revenue (All Time)</CardDescription>
        <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
          {Number(
            Number(orderItemsSumSale) +
              Number(
                revenue?.reduce(
                  (total: number, item: any) => total + item.amount,
                  0
                )
              )
          ).toLocaleString()}
        </CardTitle>
        {/* <div className="absolute right-4 top-4">
          <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
            <TrendingUpIcon className="size-3" />
            +12.5%
          </Badge>
        </div> */}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        {/* <div className="line-clamp-1 flex gap-2 font-medium">
          Trending down this month <TrendingDownIcon className="size-4" />
        </div> */}
        {/* <div className="text-muted-foreground">
          Visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  );
}
