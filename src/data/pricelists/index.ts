import { createClient } from "@/lib/supabase/server"; // Import Supabase server client
import { addDays, subDays, subYears, format } from "date-fns";

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

/**
 * Suggests a price for an item based on historical data and minimum profit margin
 * @param productId ID of the product to suggest a price for
 * @param minimumProfitMargin Minimum profit margin as a decimal (e.g., 0.4 for 40%)
 * @returns Suggested price for the product
 */
export async function suggestItemPrice(
  productId: string,
  minimumProfitMargin = 0.4
): Promise<{
  suggestedPrice: number;
  currentAveragePrice: number;
  lastYearSamePeriodPrice: number | null;
  lastYearNextPeriodPrice: number | null;
}> {
  const supabase = await createClient();
  const today = new Date();

  // Define time periods
  const thirtyDaysAgo = subDays(today, 30);
  const lastYearSameStart = subYears(thirtyDaysAgo, 1);
  const lastYearSameEnd = subYears(today, 1);
  const lastYearNextStart = addDays(lastYearSameEnd, 1);
  const lastYearNextEnd = addDays(lastYearNextStart, 29);

  console.log(`Analyzing data for product ${productId} with periods:
    Current period: ${format(thirtyDaysAgo, "yyyy-MM-dd")} to ${format(
    today,
    "yyyy-MM-dd"
  )}
    Last year same period: ${format(
      lastYearSameStart,
      "yyyy-MM-dd"
    )} to ${format(lastYearSameEnd, "yyyy-MM-dd")}
    Last year next period: ${format(
      lastYearNextStart,
      "yyyy-MM-dd"
    )} to ${format(lastYearNextEnd, "yyyy-MM-dd")}
  `);

  // 1. Get current average buying price (last 30 days)
  const { data: currentData, error: currentError } = await supabase
    .from("orders_orderitems")
    .select("buying_price")
    .eq("commodity_id", productId)
    .gte("delivery_date", thirtyDaysAgo.toISOString())
    .lte("delivery_date", today.toISOString());

  if (currentError) {
    console.error("Error fetching current price data:", currentError);
    throw new Error(
      `Failed to fetch current price data: ${currentError.message}`
    );
  }

  // Calculate current average price
  const currentAveragePrice =
    currentData && currentData.length > 0
      ? currentData.reduce((sum, item) => sum + (item.buying_price || 0), 0) /
        currentData.length
      : 0;

  // 2. Get last year same period average price
  const { data: lastYearSameData, error: lastYearSameError } = await supabase
    .from("orders_orderitems")
    .select("buying_price")
    .eq("commodity_id", productId)
    .gte("delivery_date", lastYearSameStart.toISOString())
    .lte("delivery_date", lastYearSameEnd.toISOString());

  if (lastYearSameError) {
    console.error(
      "Error fetching last year same period data:",
      lastYearSameError
    );
    // Continue despite error - we'll just use null for this value
  }

  // Calculate last year same period average price
  const lastYearSamePeriodPrice =
    lastYearSameData && lastYearSameData.length > 0
      ? lastYearSameData.reduce(
          (sum, item) => sum + (item.buying_price || 0),
          0
        ) / lastYearSameData.length
      : null;

  // 3. Get last year next period average price (forecasting data)
  const { data: lastYearNextData, error: lastYearNextError } = await supabase
    .from("orders_orderitems")
    .select("buying_price")
    .eq("commodity_id", productId)
    .gte("delivery_date", lastYearNextStart.toISOString())
    .lte("delivery_date", lastYearNextEnd.toISOString());

  if (lastYearNextError) {
    console.error(
      "Error fetching last year next period data:",
      lastYearNextError
    );
    // Continue despite error - we'll just use null for this value
  }

  // Calculate last year next period average price
  const lastYearNextPeriodPrice =
    lastYearNextData && lastYearNextData.length > 0
      ? lastYearNextData.reduce(
          (sum, item) => sum + (item.buying_price || 0),
          0
        ) / lastYearNextData.length
      : null;

  // 4. Calculate suggested price ensuring minimum profit margin
  let suggestedPrice = 0;

  if (currentAveragePrice > 0) {
    // Base price calculation with minimum margin
    let basePrice = currentAveragePrice / (1 - minimumProfitMargin);

    // If we have historical data, use it to potentially adjust the price
    if (lastYearSamePeriodPrice && lastYearNextPeriodPrice) {
      // Calculate the historical price change ratio
      const historicalChangeRatio =
        lastYearNextPeriodPrice / lastYearSamePeriodPrice;

      // Only apply if there was an increase (ratio > 1)
      if (historicalChangeRatio > 1) {
        // Apply the historical trend to our base price
        const adjustedPrice = basePrice * historicalChangeRatio;
        // Use the higher of the two prices
        suggestedPrice = Math.max(basePrice, adjustedPrice);
      } else {
        // If there was a historical decrease, still maintain our minimum margin
        suggestedPrice = basePrice;
      }
    } else {
      // Without historical data, just use the base price with minimum margin
      suggestedPrice = basePrice;
    }

    // Round to 2 decimal places
    suggestedPrice = Math.ceil(suggestedPrice * 100) / 100;
  }

  return {
    suggestedPrice,
    currentAveragePrice,
    lastYearSamePeriodPrice,
    lastYearNextPeriodPrice,
  };
}
