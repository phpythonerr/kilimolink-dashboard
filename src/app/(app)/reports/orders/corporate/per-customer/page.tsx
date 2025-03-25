import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { columns } from "./columns";
import { getUsers } from "@/data/users";
import Menu from "../menu";

export const metadata: Metadata = {
  title: "Per Customer | Corporate Order Reports",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Reports", href: "/reports" },
  { label: "Orders", href: "/reports/orders/" },
  { label: "Corporate", href: "/reports/orders/corporate" },
  {
    label: "Per Customer",
    href: "/reports/orders/per-customer",
    current: true,
  },
];

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: any) {
  const queryParams = await searchParams;

  const supabase = await createClient();

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query: any = supabase.rpc("get_customer_reports_since_first_september");

  let { data: allRows, error: allRowsError } = await query;

  let totalRows = allRows?.length;

  if (queryParams?.page && /^-?\d+$/.test(queryParams?.page)) {
    page = Number(queryParams?.page);
    let offsetStart = Number(pageSize) * Number(Number(page) - 1);

    let offsetEnd = Number(pageSize) * Number(Number(page) - 1) + pageSize;

    query = query.range(offsetStart + 1, offsetEnd);
  } else {
    query = query.range(0, pageSize);
  }

  let { data: all, error } = await query;

  totalPages = totalRows && Math.ceil(totalRows / pageSize);

  const users = await getUsers();

  const enrichedData =
    all?.map((record: any) => ({
      ...record,
      user: users.find((user: any) => user.id === record.customer),
    })) || [];

  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <Menu active="per-customer" />
      </div>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <DataTable
            data={enrichedData || []}
            columns={columns}
            pageCount={totalPages}
            currentPage={page}
            pageSize={pageSize}
          />
        </Suspense>
      </div>
    </div>
  );
}
