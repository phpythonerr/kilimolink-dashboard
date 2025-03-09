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
import { getExpenseTypes } from "@/data/accounting/expenses";
import { getVehicles } from "@/data/logistics/vehicles";
import NewExpenseForm from "./form";

export const metadata: Metadata = {
  title: "Add Expense",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Accounting", href: "/accounting" },
  { label: "Expenses", href: "/accounting/expenses" },
  { label: "Other", href: "/accounting/expenses/other" },
  {
    label: "Create",
    href: "/accounting/expenses/other/new",
    current: true,
  },
];

export default async function Index() {
  const expenseTypes = await getExpenseTypes();
  const vehicles = await getVehicles();
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="mb-4">
            <h1 className="font-bold text-xl">New Expense</h1>
            <p className="text-sm">Enter the details of the new expense.</p>
          </div>
          <Suspense fallback={<Loading />}>
            <NewExpenseForm expenseTypes={expenseTypes} vehicles={vehicles} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
