import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { getUsers, getUser } from "@/data/users";
import { fetchPaginatedData } from "@/lib/utils";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Payments",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Accounting", href: "/accounting" },
  { label: "Payments", href: "/accounting/payments", current: true },
];

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: any) {
  const queryParams = await searchParams;

  const supabase = await createClient();

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let page: number = 1;

  let query: any = supabase
    .from("finance_payment")
    .select(
      `
      *,
      inventory_purchasepaymentrelation (
        amount,
        purchase: inventory_purchases (*)
      )
    `,
      { count: "exact" }
    )
    .order("created", { ascending: false });

  if (queryParams?.page && /^-?\d+$/.test(queryParams?.page)) {
    page = Number(queryParams?.page);
    let offsetStart = Number(pageSize) * Number(Number(page) - 1);

    let offsetEnd = Number(pageSize) * Number(Number(page) - 1) + pageSize;

    query = query.range(offsetStart + 1, offsetEnd);
  } else {
    query = query.range(0, pageSize);
  }

  const { all, data, count, error, pages } = await fetchPaginatedData(
    query,
    pageSize,
    page
  );

  const userIds = [...new Set(data?.map((item: any) => item.user))];

  const users = await getUsers();

  const currentUser = await getUser();

  const userMap: any = {};
  users?.forEach((user: any) => {
    userMap[user.id] = user;
  });

  const enhancedData = data?.map((item: any) => ({
    ...item,
    initiated_by_obj: userMap[item.initiated_by] || { name: "Unknown User" },
    approved_by_obj: userMap[item.approved_by] || { name: "Unknown User" },
    in_favor_of: userMap[item.in_favor_of] || null,
    current_user: currentUser || { name: "Unknown Current User" }, // Fallback for current user
  }));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
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
        <DataTable
          data={enhancedData || []}
          columns={columns}
          pageCount={pages}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
