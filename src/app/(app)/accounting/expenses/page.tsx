import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";

export const metadata: Metadata = {
  title: "Expenses - Accounting",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Accounting", href: "/accounting" },
  { label: "Expenses", href: "/accounting/expenses", current: true },
];

export default async function Page() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-2">
          <Link href="/accounting/expenses/purchases" className="text-primary">
            Purchases
          </Link>
          <Link href="/accounting/expenses/other" className="text-primary">
            Other Expenses
          </Link>
        </div>
      </div>
    </div>
  );
}
