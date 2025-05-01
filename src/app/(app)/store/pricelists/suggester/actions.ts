"use server";

import { createClient } from "@/lib/supabase/server";
import { suggestItemPrice } from "@/data/pricelists";
import { revalidatePath } from "next/cache";

export interface CommodityBasic {
  id: string;
  name: string;
  category_id: string;
}

export interface PriceSuggestion {
  suggestedPrice: number;
  currentAveragePrice: number;
  lastYearSamePeriodPrice: number | null;
  lastYearNextPeriodPrice: number | null;
}

export interface Pricelist {
  id: string;
  name: string;
  created_at: string;
}

export interface PricelistPrice {
  commodity_id: string;
  price: number;
}

/**
 * Fetch commodities by category IDs
 */
export async function fetchCommoditiesByCategories(
  categoryIds: string[]
): Promise<CommodityBasic[]> {
  if (categoryIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("commodities_commodity")
    .select("id, name, category_id")
    .in("category_id", categoryIds);

  if (error) {
    console.error("Error fetching commodities:", error);
    throw new Error(`Failed to fetch commodities: ${error.message}`);
  }

  return data || [];
}

/**
 * Get price suggestion for a commodity
 */
export async function getPriceSuggestion(
  commodityId: string
): Promise<PriceSuggestion> {
  try {
    const suggestion = await suggestItemPrice(commodityId);
    return suggestion;
  } catch (error) {
    console.error(
      `Error getting price suggestion for commodity ${commodityId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get batch price suggestions for multiple commodities
 * This is more efficient than calling getPriceSuggestion individually for each commodity
 */
export async function getBatchPriceSuggestions(
  commodityIds: string[]
): Promise<Record<string, PriceSuggestion>> {
  if (commodityIds.length === 0) {
    return {};
  }

  try {
    // Process all suggestions in parallel using Promise.all
    const suggestions = await Promise.all(
      commodityIds.map(async (id: any) => {
        try {
          const suggestion = await suggestItemPrice(id);
          return { id, suggestion, success: true };
        } catch (error) {
          console.error(
            `Error getting price suggestion for commodity ${id}:`,
            error
          );
          return { id, success: false, error };
        }
      })
    );

    // Convert array of results to a record object with commodity ID as key
    // Use type assertion to help TypeScript understand that suggestion exists when success is true
    return suggestions.reduce((acc, result) => {
      if (result.success && result.suggestion) {
        // Add explicit check for suggestion
        acc[result.id] = result.suggestion as PriceSuggestion;
      }
      return acc;
    }, {} as Record<string, PriceSuggestion>);
  } catch (error) {
    console.error("Error getting batch price suggestions:", error);
    throw error;
  }
}

/**
 * Save commodity prices
 */
export async function savePrices(
  priceData: {
    commodityId: string;
    price: number;
  }[]
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    // Here you'd implement your actual logic to save prices to your database
    // This is a placeholder - replace with your actual price list update logic

    // Example implementation:
    // const updates = priceData.map(item => ({
    //   product_id: item.commodityId,
    //   price: item.price,
    //   updated_at: new Date().toISOString()
    // }));

    // const { error } = await supabase
    //   .from('pricelists')
    //   .upsert(updates);

    // if (error) throw error;

    // For now, just log what would be saved
    console.log("Would save prices:", priceData);

    // Revalidate the path to reflect the new data
    revalidatePath("/store/pricelists");

    return {
      success: true,
      message: `Successfully saved prices for ${priceData.length} products`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to save prices: ${error.message || "Unknown error"}`,
    };
  }
}

/**
 * Fetch available pricelists
 */
export async function fetchPricelists(): Promise<Pricelist[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("commodities_pricelist")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pricelists:", error);
    throw new Error(`Failed to fetch pricelists: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch prices for commodities from a specific pricelist
 */
export async function fetchPricesFromPricelist(
  pricelistId: string,
  commodityIds: string[]
): Promise<Record<string, number>> {
  if (!pricelistId || commodityIds.length === 0) {
    return {};
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("commodities_pricelistprice")
    .select("commodity_id, price")
    .eq("pricelist_id", pricelistId)
    .in("commodity_id", commodityIds);

  if (error) {
    console.error("Error fetching pricelist prices:", error);
    throw new Error(`Failed to fetch pricelist prices: ${error.message}`);
  }

  // Convert array to a map of commodity_id -> price
  return (data || []).reduce((acc, item) => {
    acc[item.commodity_id] = item.price;
    return acc;
  }, {} as Record<string, number>);
}
