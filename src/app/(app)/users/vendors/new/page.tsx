import type { Metadata } from "next";
import { Suspense } from "react";
import NewVendorForm from "./form";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";

export const metadata: Metadata = {
  title: "Vendors",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Users", href: "/users" },
  { label: "Vendors", href: "/users/vendors" },
  {
    label: "New",
    href: "/users/vendors/new",
    current: true,
  },
];

export default async function Page() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="mb-4">
            <h1 className="font-bold text-xl">New Vendor</h1>
            <p className="text-sm">Register a New Vendor</p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <NewVendorForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
