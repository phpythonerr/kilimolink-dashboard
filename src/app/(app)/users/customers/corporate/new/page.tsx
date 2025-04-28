import { createClient } from "@/lib/supabase/server";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import Form from "./form"; // Import the client form component
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/components/loading";

export const metadata: Metadata = {
  title: "New Corporate Customer",
};

// Define types for fetched data
type PriceList = {
  id: string;
  name: string;
};

type BankAccount = {
  id: string;
  bank_name: string;
  acc_number: string;
  acc_name: string; // Or bank_name + acc_number if preferred
};

type Category = {
  id: string;
  name: string;
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Users", href: "/users" },
  { label: "Customers", href: "/users/customers" },
  {
    label: "Corporate",
    href: "/users/customers/corporate",
  },
  {
    label: "Register",
    href: "/users/customers/corporate/new",
    current: true,
  },
];

export default async function NewCorporateCustomerPage() {
  const supabase = await createClient();

  // Fetch Price Lists
  const { data: priceListsData, error: priceListsError } = await supabase
    .from("commodities_pricelist")
    .select("id, name")
    .order("name");

  // Fetch Bank Accounts (only those relevant for invoicing, adjust filter if needed)
  const { data: bankAccountsData, error: bankAccountsError } = await supabase
    .from("finance_account")
    .select("id, acc_name, bank_name, acc_number") // Select fields needed for display/value
    .order("acc_name");

  // Fetch Commodity Categories
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("commodities_category")
    .select("id, name")
    .order("name");

  // Handle potential errors during data fetching (optional but recommended)
  if (priceListsError || bankAccountsError || categoriesError) {
    console.error(
      "Error fetching data:",
      priceListsError,
      bankAccountsError,
      categoriesError
    );
    // Render an error message or fallback UI
    return <div>Error loading form data. Please try again later.</div>;
  }

  const priceLists: PriceList[] = priceListsData || [];
  const bankAccounts: BankAccount[] = bankAccountsData || [];
  const categories: Category[] = categoriesData || [];

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-lg font-medium">Create New Corporate Customer</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to add a new corporate customer.
          </p>
        </div>
        <Suspense fallback={<Loading />}>
          <Form
            priceLists={priceLists}
            bankAccounts={bankAccounts}
            categories={categories}
          />
        </Suspense>
      </div>
    </div>
  );
}
