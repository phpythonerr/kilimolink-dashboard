import type { Metadata } from "next";
import StatementForm from "./form";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server"; // Import Supabase server client

export const metadata: Metadata = {
  title: "Statement of Accounts - Accounting Reports",
  description: "",
};

const breadcrumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reports", href: "/reports" },
  { label: "Accounting", href: "/reports/accounting" },
  {
    label: "Statement of Accounts",
    href: "/reports/accounting/statement-of-accounts",
    current: true,
  },
];

export default async function StatementOfAccountsPage() {
  const supabase = await createClient();

  // Fetch customers (profiles) using Supabase
  const { data: customerData, error } = await supabase
    .from("profiles") // Use table name as string
    .select("id, business_name") // Adjust column names if needed
    .eq("user_type", "buyer"); // Adjust column name and value if needed

  if (error) {
    console.error("Error fetching customers:", error);
    // Handle error appropriately, maybe show an error message
    // For now, pass an empty array or throw
    // throw new Error("Failed to load customer data.");
  }

  // Map Supabase data to the expected format for the form component
  const customers = (customerData || []).map((profile) => ({
    id: profile.id, // Use the fetched 'id'
    name: profile.business_name, // Use the fetched 'business_name'
  }));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <div>
        <h1 className="mb-4 text-2xl font-bold">Statement of Accounts</h1>
        {/* Pass the correctly formatted customer data */}
        <StatementForm customers={customers} />
        {/* Results will be displayed via the form component's state */}
      </div>
    </div>
  );
}
