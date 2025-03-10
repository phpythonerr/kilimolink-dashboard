import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Products",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Store", href: "/store" },
  { label: "Products", href: "/store/products", current: true },
];

interface SearchParams extends Record<string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: PageProps) {
  const queryParams = await searchParams;

  const supabase = await createClient();

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query;

  if (queryParams.category) {
    query = supabase
      .from("commodities_commodity")
      .select("id, name, classification, selling_price, image")
      .eq("category_id", queryParams.category)
      .order("name", { ascending: true });
  } else {
    query = supabase
      .from("commodities_commodity")
      .select("id, name, classification, selling_price, quantity_unit, image")
      .order("name", { ascending: true });
  }

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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
        <div>
          <Button size="sm" asChild>
            <Link href="/store/products/new">New Product</Link>
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
