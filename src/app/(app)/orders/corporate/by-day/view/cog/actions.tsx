"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserById } from "@/data/users";
import { z } from "zod";

export async function updateUnitCost(fd: FormData) {
  const supabase = await createClient();
  const commodityID = fd.get("commodity_id");
  const deliveryDate = fd.get("delivery_date");
  const buyingPrice = fd.get("buying_price");

  if (!commodityID || !buyingPrice || !deliveryDate) {
    return { error: "Missing required fields" };
  }

  try {
    let { data, error }: any = await supabase
      .from("orders_orderitems")
      .update({
        buying_price: buyingPrice,
      })
      .eq("commodity_id", commodityID)
      .eq("delivery_date", deliveryDate);

    if (!error) {
      return { success: true };
    }

    return { error: error.message };

    revalidatePath("/orders/corporate/view/items");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
