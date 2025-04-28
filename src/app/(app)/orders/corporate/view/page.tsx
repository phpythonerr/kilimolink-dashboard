import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";
import { getUsers } from "@/data/users";
import { Info } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ActionButton } from "./action-button";
import { OrderStatusSelect } from "./order-status-select";
import { PaymentStatusSelect } from "./payment-status-select";

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
      <div className="mb-4 flex justify-between items-center gap-2">
        <h1 className="font-medium text-2xl">
          Order #{`K${order?.order_number}S`}
        </h1>
        <ActionButton
          id={queryParams?.id}
          order_number={order?.order_number}
          customer={customer}
          items={items}
          revenue={revenue}
          bankAccount={bankAccount}
          orderTotal={order?.total || 0}
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
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium w-40 h-16">Order #</TableCell>
              <TableCell>{`K${order?.order_number}S`}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium h-16">Status</TableCell>
              <TableCell>
                <OrderStatusSelect
                  orderId={queryParams?.id}
                  defaultValue={order?.status}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium h-16">Payment Status</TableCell>
              <TableCell>
                <PaymentStatusSelect
                  orderId={queryParams?.id}
                  defaultValue={order?.payment_status}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium h-16">Customer</TableCell>
              <TableCell>
                <Link
                  href={`/users/customers/corporate/view?id=${order?.user}`}
                  className="text-primary"
                >
                  {`${customer?.user_metadata?.business_name} ${
                    order?.branch ? ` - ${order?.branch}` : ""
                  }`}
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium h-16">Business Type</TableCell>
              <TableCell>{customer?.user_metadata?.business_type}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium h-16">Total</TableCell>
              <TableCell>{`Ksh.${Number(
                order?.total
              ).toLocaleString()}`}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium h-16">Delivery Date</TableCell>
              <TableCell>
                {new Date(order?.delivery_date).toDateString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
