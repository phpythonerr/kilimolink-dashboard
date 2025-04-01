import { createClient } from "@/lib/supabase/server";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import type { Metadata } from "next";
import { FuelChart } from "./fuel-chart";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "View Vehicle",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Logistics", href: "/logistics" },
  { label: "Vehicles", href: "/logistics/vehicles" },
  {
    label: "View",
    href: "/logistics/vehicles/weekly",
    current: true,
  },
];

export default async function Page({ searchParams }: any) {
  const supabase = await createClient();
  const queryParams = await searchParams;

  const { data, error } = await supabase
    .from("finance_expense")
    .select("date, amount")
    .eq("expense_type_id", "f9bb215a-e1fd-4391-bd1c-e309521d3b51")
    .eq("object_identifier", queryParams?.id)
    .order("date", { ascending: false });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          <FuelChart chartData={data} />
        </div>
      </Suspense>
    </div>
  );
}
