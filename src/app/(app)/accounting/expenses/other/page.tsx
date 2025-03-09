import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Other Expenses",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Accounting", href: "/accounting" },
  { label: "Expenses", href: "/accounting/expenses" },
  {
    label: "Order",
    href: "/accounting/expenses/other",
    current: true,
  },
];

interface SearchParams extends Record<string, string | string[] | undefined> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: PageProps) {
  const queryParams = await searchParams;
  const supabase = await createClient();

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query: any = supabase
    .from("finance_expense")
    .select(
      "id, expense_type_id ( name ), amount, date, txn_reference_code, description, source_of_funds, added_by",
      { count: "exact" }
    )
    .order("date", { ascending: false });

  let { data: allOrders, error: allOrdersError } = await query;

  let totalOrders = allOrders?.length;

  if (queryParams?.page && /^-?\d+$/.test(queryParams?.page)) {
    page = Number(queryParams?.page);
    let offsetStart = Number(pageSize) * Number(Number(page) - 1);

    let offsetEnd = Number(pageSize) * Number(Number(page) - 1) + pageSize;

    query = query.range(offsetStart + 1, offsetEnd);
  } else {
    query = query.range(0, pageSize);
  }

  let { data: orders, error } = await query;

  totalPages = totalOrders && Math.ceil(totalOrders / pageSize);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
        <div>
          <Button size="sm" asChild>
            <Link href="/accounting/expenses/other/new">Add Expense</Link>
          </Button>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          data={orders || []}
          columns={columns}
          pageCount={totalPages}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
