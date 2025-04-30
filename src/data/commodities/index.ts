import { createClient } from "@/lib/supabase/server";

// Define the expected return type
type Category = {
  id: string;
  name: string;
};

export async function getCommodityCategories(): Promise<Category[]> {
  console.log("Fetching commodity categories...");

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("commodities_category")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to fetch commodity categories:", err);
    return [];
  }
}
