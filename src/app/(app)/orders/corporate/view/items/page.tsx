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
import { getUserById } from "@/data/users";
import { getOrder } from "@/data/orders";
import { getProducts, getProductItems } from "@/data/products";
import { ActionButton } from "../action-button";

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
  const user = order ? await getUserById(order?.user) : null;

  const enabledCategories = user?.user?.user_metadata?.enabled_categories || [];

  const filteredProducts = products.filter((product: any) =>
    enabledCategories.includes(product.category_id)
  );

  let { data: order }: any = await supabase
    .from("orders_order")
    .select("*")
    .eq("id", queryParams?.id)
    .single();

  const users = await getUsers();

  let customers = users.filter(
    (user: any) => user?.user_metadata?.user_type === "buyer"
  );

  let customers_arr: any = [];

  customers.map((customer: any) =>
    customers_arr.push({
      id: customer?.id,
      name: `${customer?.user_metadata?.business_name}`,
    })
  );

  let customer: any = null;

  if (order) {
    customer = users.filter((user: any) => user?.id === order?.user)[0];
  }

  let { data: revenue }: any = await supabase
    .from("finance_revenue")
    .select("amount, vat_rule, revenue_type_id ( name )")
    .eq("order_id", queryParams?.id);

  let userBankAccount = "e8ee6e18-3170-4425-9f0b-012e6dd2a86f";

  if (customer?.user_metadata?.bank_account) {
    userBankAccount = customer?.user_metadata?.bank_account;
  }

  const { data: bankAccount, error: bankAccountError }: any = await supabase
    .from("finance_account")
    .select("*")
    .eq("id", userBankAccount)
    .single();

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-end items-center gap-2">
        <ActionButton
          id={queryParams?.id}
          order_number={order?.order_number}
          customer={customer}
          items={items}
          revenue={revenue}
          bankAccount={bankAccount}
        />
      </div>
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
            <Form products={filteredProducts} items={items} order={order} />
          </Table>
        </Suspense>
      </div>
    </div>
  );
}
