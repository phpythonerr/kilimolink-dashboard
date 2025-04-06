import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchPaginatedData } from "@/lib/utils";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { PaymentDialog } from "./payment-dialog";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/data/users";
import { DataTable } from "@/components/app-datatable";
import { columns } from "./columns";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "View Vendor",
  description: "",
};

export default async function Page({ searchParams }: any) {
  const queryParams = await searchParams;

  const user: any = await getUserById(queryParams.id as string);
  if (!user || !user?.user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">Vendor not found</h1>
      </div>
    );
  }
  if (user?.error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">
          Error fetching vendor: {user.error.message}
        </h1>
      </div>
    );
  }
  const vendor = user?.user;
  if (!vendor) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">Vendor not found</h1>
      </div>
    );
  }
  // Ensure the vendor has a valid ID
  if (!queryParams.id || queryParams.id !== vendor.id) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">Vendor not found</h1>
      </div>
    );
  }
  // If the vendor is found, proceed to fetch their purchase data
  if (!vendor.id) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">
          Vendor ID is invalid
        </h1>
      </div>
    );
  }
  // Fetch the purchase data for the vendor
  if (!queryParams.id) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">
          Vendor ID is required
        </h1>
      </div>
    );
  }
  // Create a Supabase client

  const supabase = await createClient();

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users", href: "/users" },
    {
      label: "Vendors",
      href: "/users/vendors",
    },
    {
      label: ` ${
        vendor?.user_metadata?.first_name || vendor?.user_metadata?.firstName
      } ${vendor?.user_metadata?.last_name || vendor?.user_metadata?.lastName}`,
      href: `/users/vendors/view?id=${vendor.id}`,
      current: true,
    },
  ];

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let page: number = Number(queryParams.page) || 1;

  const query = supabase
    .from("inventory_purchases")
    .select("*", { count: "exact" })
    .eq("vendor", queryParams.id)
    .order("purchase_date", { ascending: false });

  const { all, data, count, error, pages } = await fetchPaginatedData(
    query,
    pageSize,
    page
  );

  const paid = all.filter(
    (item: any) =>
      item?.payment_status === "Paid" ||
      item?.payment_status === "Partially-Paid"
  );

  const unpaid = all.filter(
    (item: any) =>
      item?.payment_status === "Unpaid" ||
      item?.payment_status === "Partially-Paid"
  );

  const totalPurchaseValue = all.reduce((acc: number, item: any) => {
    const itemValue = (item?.unit_price || 0) * (item?.quantity || 0);
    return acc + itemValue;
  }, 0);

  const totalPaid = paid.reduce((acc: number, item: any) => {
    let itemValue = 0;
    if (item?.payment_status === "Paid") {
      itemValue = (item?.unit_price || 0) * (item?.quantity || 0);
    } else if (item?.payment_status === "Partially-Paid") {
      // For partially paid, we consider the paid portion
      itemValue = item?.paid_amount;
    }
    return acc + itemValue;
  }, 0);

  const totalUnpaid = unpaid.reduce((acc: number, item: any) => {
    let itemValue = 0;
    if (item?.payment_status === "Unpaid") {
      itemValue = (item?.unit_price || 0) * (item?.quantity || 0);
    } else if (item?.payment_status === "Partially-Paid") {
      // For partially paid, we consider the unpaid portion
      itemValue = item?.balance;
    }
    return acc + itemValue;
  }, 0);

  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-medium text-xl">{` ${
          vendor?.user_metadata?.first_name || vendor?.user_metadata?.firstName
        } ${
          vendor?.user_metadata?.last_name || vendor?.user_metadata?.lastName
        }`}</h1>
      </div>
      <div>
        <Suspense>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="@container/card">
                <CardHeader className="relative">
                  <CardDescription>Total Purchases Value</CardDescription>
                  <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                    Ksh.{totalPurchaseValue.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="text-muted-foreground">{`${all.length} Total purchases`}</div>
                </CardFooter>
              </Card>
              <Card className="@container/card">
                <CardHeader className="relative">
                  <CardDescription>Paid Purchases</CardDescription>
                  <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                    Ksh.{totalPaid.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="text-muted-foreground">{`${paid.length} Paid Purchases`}</div>
                </CardFooter>
              </Card>
              <Card className="@container/card">
                <CardHeader className="relative">
                  <CardDescription>Unpaid Purchases</CardDescription>
                  <CardTitle className="@[250px]/card:text-xl text-lg font-semibold tabular-nums">
                    Ksh.{totalUnpaid.toLocaleString()}
                  </CardTitle>
                  {unpaid.length > 0 && (
                    <div className="absolute right-4 top-4">
                      <PaymentDialog
                        unpaidPurchases={unpaid}
                        totalUnpaid={totalUnpaid}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardFooter className="flex-col items-start gap-2">
                  <div className="text-muted-foreground">{`${unpaid.length} Unpaid Purchases`}</div>
                </CardFooter>
              </Card>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="font-medium text-lg">Purchases</h2>
              <div>
                <DataTable
                  data={data || []}
                  columns={columns}
                  pageCount={pages}
                  currentPage={page}
                  pageSize={pageSize}
                />
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
