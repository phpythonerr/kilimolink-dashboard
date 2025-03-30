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

export default async function SalesLast30DaysCard() {
  const supabase = await createClient();
  let { data: last30Days, error: last30DaysError }: any = await supabase.rpc(
    "get_selling_buying_report_last_30_days_v2"
  );
  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Sales Last 30 Days</CardDescription>
        <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
          {last30Days
            .reduce(
              (total: number, item: any) => total + item?.total_selling_price,
              0
            )
            .toLocaleString()}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
            <TrendingUpIcon className="size-3" />
            +12.5%
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <TrendingUpIcon className="size-4" />
        </div>
        {/* <div className="text-muted-foreground">
          Visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  );
}
