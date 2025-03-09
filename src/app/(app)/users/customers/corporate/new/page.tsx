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
import Form from "./form";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";

export const metadata: Metadata = {
  title: "Register Corporate Customer",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Users", href: "/users" },
  { label: "Customers", href: "/users/customers" },
  { label: "Corporate", href: "/users/customers/corporate" },
  { label: "Register", href: "/users/customers/corporate/new", current: true },
];

export default function Index() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="mb-4">
            <h1 className="font-bold text-xl">New Corporate Customer</h1>
            <p className="text-sm">
              Enter the details of the new corporate customer.
            </p>
          </div>
        </div>
        <Form />
      </div>
    </div>
  );
}
