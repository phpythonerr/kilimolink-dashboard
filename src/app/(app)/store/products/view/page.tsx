import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import {
  getSingleProduct,
  getSingleProductPriceHistory,
} from "@/data/products";
import { Chart } from "./chart";

export const metadata: Metadata = {
  title: "View Product",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Store", href: "/store" },
  { label: "Products", href: "/store/products" },
  {
    label: "View",
    href: "/store/products/categories/view",
    current: true,
  },
];

interface PriceHistory {
  date: string;
  total: number;
}

interface ChartDataPoint {
  date: string;
  price: number;
}

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: any) {
  const queryParams = await searchParams;

  const product = await getSingleProduct(queryParams.id);

  const priceHistory = await getSingleProductPriceHistory(queryParams.id);

  const chartData: ChartDataPoint[] = [];

  priceHistory?.map((item: PriceHistory) =>
    chartData.push({
      date: item?.date,
      price: item?.total,
    })
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Chart chartData={chartData} />
      </Suspense>
    </div>
  );
}
