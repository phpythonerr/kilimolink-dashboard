"use server";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getProducts = cache(async () => {
  const supabase = await createClient();

  const { data: products, error }: any = await supabase
    .from("commodities_commodity")
    .select("*")
    .order("name");

  if (error) return { error: error };

  return products;
});

export const getProductItems = cache(async (id: string) => {
  const supabase = await createClient();

  let { data: items, error }: any = await supabase
    .from("orders_orderitems")
    .select(
      "id, selling_price, quantity, buying_price, customer, uom, order_id ( id ), delivery_date, commodity_id (id, name, quantity_unit )"
    )
    .eq("order_id", id);

  if (error) return { error: error };

  return items;
});

export const getSingleProduct = cache(async (id: string) => {
  const supabase = await createClient();

  let { data: commodity, error: commodityError }: any = await supabase
    .from("commodities_commodity")
    .select("id, name, classification, selling_price, image")
    .eq("id", id)
    .single();

  if (commodityError) return { error: commodityError };

  return commodity;
});

export const getSingleProductPriceHistory = cache(async (id: string) => {
  const supabase = await createClient();

  let { data: priceHistory, error: priceHistoryError }: any =
    await supabase.rpc("price_history_full", {
      selected_commodity_id: id,
    });

  if (priceHistoryError) return { error: priceHistoryError };

  return priceHistory;
});
