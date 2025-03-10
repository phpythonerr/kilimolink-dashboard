import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Corporate Orders By Day",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Orders", href: "/orders" },
  { label: "Order By Day", href: "/orders/corporate/by-day", current: true },
];

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: any) {
  const supabase = await createClient();

  let pageSize: number = Number(searchParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query: any = supabase.rpc("get_orders_by_day");

  let { data: allOrders, error: allOrdersError } = await query;

  let totalOrders = allOrders?.length;

  if (searchParams?.page && /^-?\d+$/.test(searchParams?.page)) {
    page = Number(searchParams?.page);
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
            <Link href="/orders/corporate/new">New Order</Link>
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
