import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";

export const metadata: Metadata = {
  title: "Payments - Accounting",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Accounting", href: "/accounting" },
  { label: "Payments", href: "/accounting/payments", current: true },
];

export default async function Page() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div></div>
    </div>
  );
}
