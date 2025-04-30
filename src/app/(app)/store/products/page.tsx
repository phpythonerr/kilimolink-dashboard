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
  { label: "Dashboard", href: "/dashboard" },
  { label: "Store", href: "/store" },
  { label: "Products", href: "/store/products", current: true },
];

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: any) {
  const queryParams = await searchParams;

  const supabase = await createClient();

  const pageSize = Number(queryParams.pageSize) || 10;
  let page = Number(queryParams.page) || 1;
  let totalPages = 0;

  let query = supabase
    .from("commodities_commodity")
    .select("id, name, classification, selling_price, quantity_unit, image");

  if (queryParams.category) {
    query = query.eq("category_id", queryParams.category);
  }

  query = query.order("name", { ascending: true });

  const { data: allRows, error: allRowsError } = await query;

  if (allRowsError) {
    console.error("Error fetching rows:", allRowsError);
    throw new Error("Failed to fetch products");
  }

  // Calculate total pages with proper type checking
  const totalRows = allRows?.length || 0;
  totalPages = Math.ceil(totalRows / pageSize);

  // Handle pagination
  if (page > 0) {
    const offsetStart = pageSize * (page - 1);
    const offsetEnd = offsetStart + pageSize - 1;
    query = query.range(offsetStart, offsetEnd);
  } else {
    query = query.range(0, pageSize - 1);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }

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
          data={products || []}
          columns={columns}
          pageCount={totalPages}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
