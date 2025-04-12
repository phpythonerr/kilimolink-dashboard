import { PackageIcon } from "lucide-react";
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

  const today = new Date().toISOString().split("T")[0];

  const { data, count, error } = await supabase
    .from("orders_order")
    .select("*", { count: "exact", head: true });

  const todayOrders =
    data?.filter((order: any) => order.created === today) || [];
  const todayCount = todayOrders.length;

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription className="flex items-center gap-2">
          Total Orders
        </CardDescription>
        <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
          {count?.toLocaleString()}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge
            variant={todayCount > 0 ? "default" : "secondary"}
            className="flex gap-1 rounded-lg text-xs"
          >
            {todayCount} today
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        {/* <div className="line-clamp-1 flex gap-2 font-medium">
          {todayCount} new orders today
        </div> */}
        {/* <div className="text-muted-foreground">
          {percentageChange}% of total orders
        </div> */}
      </CardFooter>
    </Card>
  );
}
