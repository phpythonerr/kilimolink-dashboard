import { createClient } from "@/lib/supabase/server";
import Form from "./form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Price Suggestions",
  description: "Suggest optimal prices for products based on historical data",
};

export default async function PriceSuggesterPage() {
  const supabase = await createClient();

  // Fetch all categories from the database
  const { data: categories, error } = await supabase
    .from("commodities_category")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return <div>Error loading categories: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Price Suggester</h1>
      <p className="text-muted-foreground mb-6">
        Select categories to get price suggestions based on historical data.
        Suggestions target a minimum 40% profit margin and consider seasonal
        trends from previous years.
      </p>

      <Form categories={categories || []} />
    </div>
  );
}
