import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";

export const metadata: Metadata = {
  title: "Users",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Users", href: "/users" },
  { label: "Customers", href: "/users/customers", current: true },
];

export default async function Page() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-2">
          <Link href="/users/customers/corporate" className="text-primary">
            Corporate
          </Link>
        </div>
      </div>
    </div>
  );
}
