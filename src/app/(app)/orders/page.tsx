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

export const metadata: Metadata = {
  title: "New Corporate Order",
  description: "",
};

const breadcrumbs = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Orders",
    href: "/orders",
    current: true,
  },
];

export default function Index() {
  let customers: [] = [];
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="mb-4">
            <h1 className="font-bold text-xl">Orders</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
