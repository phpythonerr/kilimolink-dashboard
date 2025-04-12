import { Suspense } from "react";
import { DataTable } from "@/components/app-datatable";
import { getInventoryLedger } from "@/data/inventory";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns } from "./columns";

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    page?: string;
    pageSize?: string;
  };
}

export default function InventoryLedgerPage({
  params,
  searchParams,
}: PageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");

  return (
    <div className="p-4">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-2">
          <Link href="/store/inventory">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <Suspense fallback={<div>Loading inventory ledger...</div>}>
          <InventoryLedgerContent
            inventoryId={params.id}
            page={page}
            pageSize={pageSize}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function InventoryLedgerContent({
  inventoryId,
  page,
  pageSize,
}: {
  inventoryId: string;
  page: number;
  pageSize: number;
}) {
  const { items, productName, totalCount, pageCount, currentPage } =
    await getInventoryLedger(inventoryId, page, pageSize);

  const breadcrumbs = [
    { title: "Home", href: "/" },
    { title: "Store", href: "/store" },
    { title: "Inventory", href: "/store/inventory" },
    { title: "Ledger", href: `/store/inventory/${inventoryId}/ledger` },
  ];

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {productName} - Ledger
        </h1>
        <p className="text-muted-foreground">
          View all inventory transactions for this product
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This ledger shows all inventory movements for the product. Inventory
            records cannot be modified or deleted directly as they are generated
            from source transactions.
          </p>

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transaction history found for this product.
            </div>
          ) : (
            <DataTable
              data={items || []}
              columns={columns}
              pageCount={pageCount}
              currentPage={currentPage}
              pageSize={pageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
