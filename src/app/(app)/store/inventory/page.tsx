import { Suspense } from "react";
import { DataTable } from "@/components/app-datatable";
import { getInventoryItems } from "@/data/inventory";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { columns } from "./columns";

interface PageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
    search?: string;
  };
}

export default async function InventoryPage({ searchParams }: any) {
  const queryParams = await searchParams;

  const page = parseInt(queryParams.page || "1");
  const pageSize = parseInt(queryParams.pageSize || "10");
  const searchQuery = queryParams.search || "";

  const breadcrumbs = [
    { title: "Home", href: "/" },
    { title: "Store", href: "/store" },
    { title: "Inventory", href: "/store/inventory" },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            View all products in inventory
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Suspense fallback={<div>Loading inventory data...</div>}>
          <InventoryList
            page={page}
            pageSize={pageSize}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function InventoryList({
  page,
  pageSize,
  searchQuery,
}: {
  page: number;
  pageSize: number;
  searchQuery: string;
}) {
  const { items, totalCount, pageCount, currentPage } = await getInventoryItems(
    page,
    pageSize,
    searchQuery
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search products..."
              className="pl-8"
              defaultValue={searchQuery}
            />
          </form>
        </div>
      </div>

      <DataTable
        data={items || []}
        columns={columns}
        pageCount={pageCount}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
