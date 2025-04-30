import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import ProductForm from "./form"; // Import the client component

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
// Update the import path for the data fetching function to the new location
import { getCommodityCategories } from "@/data/commodities"; // Corrected import path

export const metadata: Metadata = {
  title: "Add Product", // Updated title
  description: "Add a new product to the store.", // Updated description
};

// Update breadcrumbs for products
const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Store", href: "/store" },
  { label: "Products", href: "/store/products" },
  {
    label: "New",
    href: "/store/products/new",
    current: true,
  },
];

export default async function NewProductPage() {
  // Renamed function
  // Fetch categories on the server
  const categories = await getCommodityCategories(); // Ensure this function returns { id: string, name: string }[]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="mb-4">
            <h1 className="font-bold text-xl">Add Product</h1>
            <p className="text-sm text-muted-foreground">
              Enter the details of the new product.
            </p>{" "}
            {/* Updated text */}
          </div>
          <Suspense fallback={<Loading />}>
            {" "}
            {/* Use Loading component */}
            {/* Pass fetched categories to the form */}
            <ProductForm categories={categories} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
