import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import {
  Table,
  TableCaption,
  TableBody,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/admin/server";
import { DataTable } from "@/components/app-datatable";
import { getUsers } from "@/data/users";
import { columns } from "../../columns";
import ItemTableRow from "./table-row";
import Menu from "../menu";

export const metadata: Metadata = {
  title: "Corporate Orders",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Orders", href: "/orders" },
  { label: "Corporate", href: "/orders/corporate" },
  { label: "Order By Day", href: "/orders/corporate/by-day" },
  { label: "CoG", href: "/orders/corporate/by-day/cog", current: true },
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

  const query: any = supabase.rpc("date_order_items", {
    selected_date: queryParams?.date,
  });

  const { data, error } = await query;

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
      <div className="my-3">
        <Menu active="cog" date={queryParams?.date} />
      </div>
      <Suspense
        fallback={
          <div className="w-full h-96 flex justify-center items-center">
            <div className="flex flex-col gap-2 items-center">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-800"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Avg. Buying Price</TableHead>
              <TableHead>Avg. Selling Price</TableHead>
              <TableHead>Avg. Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((item: any, index: any) => (
              <ItemTableRow
                key={item?.commodity_id}
                item={item}
                date={queryParams?.date}
              />
            ))}
          </TableBody>
        </Table>
      </Suspense>
    </div>
  );
}
