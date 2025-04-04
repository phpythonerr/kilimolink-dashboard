import { createClient } from "@/lib/supabase/server";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import type { Metadata } from "next";
import { Chart } from "./chart";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "View Expense",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reports", href: "/reports" },
  { label: "Accounting", href: "/reports/accounting" },
  { label: "Expenses", href: "/reports/orders/expenses" },
  {
    label: "View",
    href: "/reports/orders/corporate/weekly",
    current: true,
  },
];

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: any) {
  const { id } = await searchParams;
  const supabase = await createClient();

  let { data, error }: any = await supabase.rpc("view_expense_report_by_day", {
    expensetypeid: id,
  });

  const chartData = data
    ?.map((item: any) => ({
      date: item?.expense_date,
      price: item?.total_expense,
    }))
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          <Chart chartData={chartData} expenseName={data[0].expense_name} />
        </div>
      </Suspense>
    </div>
  );
}
