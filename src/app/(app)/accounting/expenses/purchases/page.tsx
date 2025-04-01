import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { getUsers } from "@/data/users";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Purchases | Accounting Expenses",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Accounting", href: "/accounting" },
  { label: "Expenses", href: "/accounting/expenses" },
  {
    label: "Purchases",
    href: "/accounting/expenses/purchases",
    current: true,
  },
];

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: any) {
  const queryParams = await searchParams;
  const supabase = await createClient();

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query: any = supabase
    .from("inventory_purchases")
    .select(
      "created_date, vendor, product_id ( id, name), quantity, unit_price, payment_status, product_uom",
      {
        count: "exact",
      }
    )
    .order("created_date", { ascending: false });

  if (queryParams?.page && /^-?\d+$/.test(queryParams?.page)) {
    page = Number(queryParams?.page);
    let offsetStart = Number(pageSize) * Number(Number(page) - 1);

    let offsetEnd = Number(pageSize) * Number(Number(page) - 1) + pageSize;

    query = query.range(offsetStart + 1, offsetEnd);
  } else {
    query = query.range(0, pageSize);
  }

  const {
    data: allPurchases,
    count: totalPurchase,
    error: allPurchasesError,
  } = await query;

  totalPages = totalPurchase && Math.ceil(totalPurchase / pageSize);

  const users = await getUsers();

  const userMap: any = {};
  users?.forEach((user: any) => {
    userMap[user.id] = user;
  });

  const enhancedData = allPurchases?.map((item: any) => ({
    ...item,
    user_obj: userMap[item.vendor] || { name: "Unknown User" },
  }));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
        <div>
          <Button size="sm" asChild>
            <Link href="/accounting/expenses/purchases/new">Add Purchase</Link>
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
