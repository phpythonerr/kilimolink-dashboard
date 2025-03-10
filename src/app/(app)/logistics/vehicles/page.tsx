import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Other Revenues",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Logistics", href: "/logistic" },
  { label: "Vehicles", href: "/logistics/vehicles", current: true },
];

interface SearchParams extends Record<string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: any) {
  const queryParams = await searchParams;

  const supabase = await createClient();

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query: any = supabase.from("vehicles_vehicle").select("*");

  if (queryParams?.page && /^-?\d+$/.test(queryParams?.page)) {
    page = Number(queryParams?.page);
    let offsetStart = Number(pageSize) * Number(Number(page) - 1);

    let offsetEnd = Number(pageSize) * Number(Number(page) - 1) + pageSize;

    query = query.range(offsetStart + 1, offsetEnd);
  } else {
    query = query.range(0, pageSize);
  }

  let { data: all, error, count: total } = await query;

  totalPages = total && Math.ceil(total / pageSize);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
        <div>
          <Button size="sm" asChild>
            <Link href="/logistics/vehicles/new">Add Vehicle</Link>
          </Button>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          data={all || []}
          columns={columns}
          pageCount={totalPages}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
