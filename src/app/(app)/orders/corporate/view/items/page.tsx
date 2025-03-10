import { Suspense } from "react";
import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableCaption,
  TableBody,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import Loading from "@/components/loading";
import Link from "next/link";
import Form from "./form";
import { getOrder } from "@/data/orders";
import { getProducts, getProductItems } from "@/data/products";

export const metadata: Metadata = {
  title: "View Order Items",
  description: "",
};

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: any) {
  const { id } = await searchParams;
  const products = await getProducts();
  const items = await getProductItems(id);
  const order = await getOrder(id);

  return (
    <div className="p-4">
      <Tabs defaultValue="items" className="w-[350px]">
        <TabsList className="w-full">
          <TabsTrigger value="details" asChild>
            <Link href={`/orders/corporate/view?id=${id}`}>Order Details</Link>
          </TabsTrigger>
          <TabsTrigger value="items" asChild>
            <Link href={`/orders/corporate/view/items?id=${id}`}>Items</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="py-4">
        <Suspense fallback={<div>Loading...</div>}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <Form products={products} items={items} order={order} />
          </Table>
        </Suspense>
      </div>
    </div>
  );
}
