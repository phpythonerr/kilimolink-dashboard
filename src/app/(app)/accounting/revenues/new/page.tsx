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
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import Loading from "@/components/loading";
import { getRevenueTypes } from "@/data/accounting/revenues";
import { getOrdersList } from "@/data/orders";
import { getUsers } from "@/data/users";
import NewRevenueForm from "./form";

export const metadata: Metadata = {
  title: "Add Revenue",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Accounting", href: "/accounting" },
  { label: "Revenues", href: "/accounting/revenues" },
  { label: "Other", href: "/accounting/revenues/other" },
  {
    label: "Create",
    href: "/accounting/revenues/new",
    current: true,
  },
];

export default async function Index() {
  const revenueTypes = await getRevenueTypes();
  const orders = await getOrdersList();
  const userIds = [...new Set(orders?.map((item: any) => item.user))];

  const users = await getUsers();

  const userMap: any = {};
  users?.forEach((user: any) => {
    userMap[user.id] = user;
  });

  const enhancedData = orders?.map((item: any) => ({
    ...item,
    user_obj: userMap[item.user] || { name: "Unknown User" },
  }));
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="mb-4">
            <h1 className="font-bold text-xl">Add Revenue</h1>
            <p className="text-sm">Enter the details of the revenue.</p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <NewRevenueForm revenueTypes={revenueTypes} orders={enhancedData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
