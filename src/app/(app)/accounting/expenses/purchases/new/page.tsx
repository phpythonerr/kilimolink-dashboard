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
import { getUsers } from "@/data/users";

export const metadata: Metadata = {
  title: "Add Expense",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Accounting", href: "/accounting" },
  { label: "Expenses", href: "/accounting/expenses" },
  { label: "Purchases", href: "/accounting/expenses/purchases" },
  {
    label: "Create",
    href: "/accounting/expenses/purchases/new",
    current: true,
  },
];

export default async function Index() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="mb-4">
            <h1 className="font-bold text-xl">New Purchase</h1>
            <p className="text-sm">Enter the details of the new purchase.</p>
          </div>
          <Suspense fallback={<Loading />}></Suspense>
        </div>
      </div>
    </div>
  );
}
