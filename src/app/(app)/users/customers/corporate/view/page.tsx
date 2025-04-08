import { createClient } from "@/lib/supabase/server";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { fetchPaginatedData } from "@/lib/utils";
import { getUserById } from "@/data/users";
import { Chart } from "./chart";
import { Suspense } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function getDateOfISOWeek(w: number, y: number) {
  const simple = new Date(y, 0, 1 + (w - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

export default async function Page({ searchParams }: any) {
  const queryParams = await searchParams;

  const supabase = await createClient();

  const customer = await getUserById(queryParams?.id);

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let page: number = 1;

  let query = supabase
    .from("orders_order")
    .select(
      `*,
    orders_orderitems!order_id (
      quantity,
      selling_price
    )
  `,
      { count: "exact" }
    )
    .eq("user", queryParams?.id);

  if (queryParams?.page && /^-?\d+$/.test(queryParams?.page)) {
    page = Number(queryParams?.page);
    let offsetStart = Number(pageSize) * Number(Number(page) - 1);

    let offsetEnd = Number(pageSize) * Number(Number(page) - 1) + pageSize;

    query = query.range(offsetStart + 1, offsetEnd);
  } else {
    query = query.range(0, pageSize);
  }

  const { all, data, count, error, pages } = await fetchPaginatedData(
    query,
    pageSize,
    page
  );

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users", href: "/users" },
    { label: "Customers", href: "/users/customers" },
    {
      label: "Corporate",
      href: "/users/customers/corporate",
    },
    {
      label: customer?.user?.user_metadata?.business_name,
      href: `/users/customers/corporate/view?id=${queryParams?.id}`,
      current: true,
    },
  ];

  const totalSales = 0;

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <Suspense fallback={`Loading`}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="@container/card">
                <CardHeader className="relative">
                  <CardDescription>Total Orders</CardDescription>
                  <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                    Ksh.{Number(count).toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="@container/card">
                <CardHeader className="relative">
                  <CardDescription>Total Sales</CardDescription>
                  <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                    Ksh.{totalSales.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            <div>{/* <Chart chartData={chartData} /> */}</div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
