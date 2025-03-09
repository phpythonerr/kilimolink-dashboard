import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { getUsers } from "@/data/users";
import { columns } from "../columns";

export const metadata: Metadata = {
  title: "Corporate Upcoming Orders",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Orders", href: "/orders" },
  {
    label: "Upcoming Order",
    href: "/orders/corporate/upcoming",
    current: true,
  },
];

export default async function Index({ searchParams }: any) {
  const supabase = await createClient();

  let pageSize: number = Number(searchParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query: any = supabase.rpc("get_upcoming_orders");

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

  const userIds = [...new Set(orders?.map((item) => item.user))];

  const users = await getUsers();

  const userMap = {};
  users?.forEach((user) => {
    userMap[user.id] = user;
  });

  const enhancedData = orders?.map((item) => ({
    ...item,
    user_obj: userMap[item.user] || { name: "Unknown User" },
  }));

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
          data={enhancedData || []}
          columns={columns}
          pageCount={totalPages}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
