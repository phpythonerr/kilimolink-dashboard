import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { LocationFilter } from "./location-filter";
import { SellerFilter } from "./seller-filter";
import { DateFilter } from "./date-filter";
import { getUsers } from "@/data/users";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Purchases | Accounting Expenses",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
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
  const users = await getUsers();

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query: any = supabase
    .from("inventory_purchases")
    .select(
      "created_date, vendor, seller_type, product_id ( id, name), quantity, unit_price, payment_status, purchase_date, product_uom",
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

  if (queryParams.location && queryParams?.location !== "all") {
    // Get user IDs for the selected location
    const userIds = users
      .filter(
        (user: any) => user.user_metadata?.location === queryParams.location
      )
      .map((user: any) => user.id);

    query = query.in("vendor", userIds);
  }

  if (queryParams.seller && queryParams.seller !== "all") {
    query = query.eq("vendor", queryParams.seller);
  }

  if (queryParams.from) {
    query = query.gte("purchase_date", queryParams.from);
  }
  if (queryParams.to) {
    // Add one day to include the end date
    const endDate = new Date(queryParams.to);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("purchase_date", endDate.toISOString().split("T")[0]);
  }

  const {
    data: allPurchases,
    count: totalPurchase,
    error: allPurchasesError,
  } = await query;

  totalPages = totalPurchase && Math.ceil(totalPurchase / pageSize);

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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:flex-1">
            <div className="flex items-center md:items-start flex-1 gap-2">
              <div className="flex-1">
                <SellerFilter users={users} />
              </div>
              <div className="flex-1">
                <LocationFilter users={users} />
              </div>
            </div>
            <div className="flex-1">
              <DateFilter />
            </div>
          </div>
          <DataTable
            data={enhancedData || []}
            columns={columns}
            pageCount={totalPages}
            currentPage={page}
            pageSize={pageSize}
          />
        </div>
      </Suspense>
    </div>
  );
}
