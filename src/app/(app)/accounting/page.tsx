import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";

export const metadata: Metadata = {
  title: "Accounting",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Accounting", href: "/accounting", current: true },
];

export default async function Page() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-2">
          <Link href="/accounting/expenses" className="text-primary">
            Expenses
          </Link>
          <Link href="/accounting/revenues" className="text-primary">
            Revenues
          </Link>
        </div>
      </div>
    </div>
  );
}
