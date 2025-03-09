import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import NewOrderForm from "./form";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import Loading from "@/components/loading";
import { getUsers } from "@/data/users";

export const metadata: Metadata = {
  title: "New Corporate Order",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Orders", href: "/orders" },
  { label: "Corporate Orders", href: "/orders/corporate" },
  { label: "Create Order", href: "/orders/corporate/new", current: true },
];

export default async function Index() {
  const users = await getUsers();

  let customers = users?.filter(
    (user: any) =>
      user?.user_metadata?.user_type === "buyer" &&
      user?.user_metadata?.pricelist
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="mb-4">
            <h1 className="font-bold text-xl">New Corporate Order</h1>
            <p className="text-sm">
              Enter the details of the new corporate order.
            </p>
          </div>
          <Suspense fallback={<Loading />}>
            <NewOrderForm customers={customers} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
