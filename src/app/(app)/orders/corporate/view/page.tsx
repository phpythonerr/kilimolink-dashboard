import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";
import { getUsers } from "@/data/users";
import { Info } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ActionButton } from "./action-button";

export const metadata: Metadata = {
  title: "View Order",
  description: "",
};

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: any) {
  const queryParams = await searchParams;
  const supabase = await createClient();

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

  let { data: items }: any = await supabase
    .from("orders_orderitems")
    .select(
      "id, selling_price, quantity, buying_price, customer, uom, order_id( order_number, user, branch, po_number, delivery_date ), commodity_id ( id, name, quantity_unit )"
    )
    .eq("order_id", queryParams?.id);

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
      <Tabs defaultValue="details" className="w-[350px]">
        <TabsList className="w-full">
          <TabsTrigger value="details" asChild>
            <Link href={`/orders/corporate/view?id=${queryParams?.id}`}>
              Order Details
            </Link>
          </TabsTrigger>
          <TabsTrigger value="items" asChild>
            <Link href={`/orders/corporate/view/items?id=${queryParams?.id}`}>
              Items
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="py-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Under Development</AlertTitle>
          <AlertDescription>
            Order Items are available under the 'Items' Tab
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
