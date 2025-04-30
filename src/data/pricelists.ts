import { createClient } from "@/lib/supabase/server"; // Import Supabase server client

/**
 * Fetches active price lists (id and name) from the database using Supabase.
 * @returns {Promise<{id: string, name: string}[]>} A promise that resolves to an array of active price lists.
 */
export async function getActivePriceLists(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await createClient();
  try {
    const { data: pricelists, error } = await supabase
      .from("commodities_pricelist") // Specify the table name
      .select("id, name") // Select only id and name
      .eq("is_active", true) // Filter for active price lists
      .order("name", { ascending: true }); // Optional: Order by name

    if (error) {
      console.error(
        "Supabase error fetching active price lists:",
        error.message
      );
      throw error; // Re-throw the error to be handled by the caller or a global handler
    }

    return pricelists || []; // Return the data or an empty array if null/undefined
  } catch (error) {
    console.error("Failed to fetch active price lists:", error);
    // Depending on requirements, you might want to throw the error
    // or return an empty array / handle it differently.
    // Ensure the function still returns the expected type in case of caught errors outside Supabase client.
    return [];
  }
}
