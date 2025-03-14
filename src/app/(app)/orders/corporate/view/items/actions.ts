"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserById } from "@/data/users";
import { z } from "zod";

// Input validation schemas
const ProductUpdateSchema = z.object({
  item_id: z.string().optional(),
  commodity_id: z.string(),
  customer: z.string(),
  order_id: z.string().optional(),
  delivery_date: z.string().optional(),
  uom: z.string().optional(),
  selling_price: z.string().optional(),
  buying_price: z.string().optional(),
});

async function updateOrderTotal(
  supabase: any,
  orderId: FormDataEntryValue | null
): Promise<{ error?: string; success?: boolean; total?: number }> {
  if (!orderId) {
    return { error: "Order ID is required" };
  }

  const orderIdString = orderId.toString();

  try {
    // Get all items for this order
    const { data: orderItems, error: itemsError } = await supabase
      .from("orders_orderitems")
      .select("selling_price, quantity")
      .eq("order_id", orderIdString);

    if (itemsError) throw itemsError;

    // Calculate total
    const orderTotal = orderItems.reduce((total: number, item: any) => {
      const itemTotal =
        (Number(item.selling_price) || 0) * (Number(item.quantity) || 0);
      return total + itemTotal;
    }, 0);

    // Update order total
    const { error: updateError } = await supabase
      .from("orders_order")
      .update({ total: orderTotal })
      .eq("id", orderId);

    if (updateError) return { error: updateError };

    return { success: true, total: orderTotal };
  } catch (error) {
    console.error("Failed to update order total:", error);
    return { error: "Failed to update order total" };
  }
}

export async function updateProduct(fd: FormData) {
  try {
    const supabase = await createClient();

    // Extract and validate form data
    const formData = {
      item_id: fd.get("item_id")?.toString() || null,
      commodity_id: fd.get("commodity_id")?.toString() || null,
      customer: fd.get("customer")?.toString() || null,
      order_id: fd.get("order_id")?.toString(),
      delivery_date: fd.get("delivery_date")?.toString(),
      uom: fd.get("uom")?.toString(),
      selling_price: fd.get("selling_price")?.toString(),
      buying_price: fd.get("buying_price")?.toString(),
    };

    const validatedData = ProductUpdateSchema.parse(formData);

    if (!validatedData?.customer) {
      return {
        error: "Customer not found",
        source: "auth",
      };
    }

    // Get user from id
    const response = await getUserById(validatedData?.customer);

    if (response?.error) {
      return {
        error: response?.error?.message || "User not found",
        source: "auth",
      };
    }

    if (!response?.user?.user_metadata?.pricelist) {
      return {
        error: "Customer not properly configured. Missing pricelist",
        user: response?.user,
      };
    }

    // Get pricelist items
    const { data: pricelistItems, error: pricelistItemsError } = await supabase
      .from("commodities_pricelistprice")
      .select("price")
      .eq("pricelist_id", response?.user?.user_metadata.pricelist)
      .eq("commodity_id", validatedData.commodity_id)
      .single();

    if (pricelistItemsError) {
      return { error: pricelistItemsError.message };
    }

    // Get buying price history
    const { data: buyingPrice, error: buyingPriceError } = await supabase
      .from("orders_orderitems")
      .select("buying_price, commodity_id, delivery_date")
      .eq("commodity_id", validatedData.commodity_id)
      .order("delivery_date", { ascending: false });

    if (buyingPriceError) {
      return { error: buyingPriceError.message };
    }

    // Handle new item creation
    if (validatedData.item_id === "no_item") {
      const { data: commodityData, error: commodityError } = await supabase
        .from("commodities_commodity")
        .select("quantity_unit")
        .eq("id", validatedData.commodity_id)
        .single();

      if (commodityError) {
        return { error: commodityError.message };
      }

      const { data: newItem, error: newItemError } = await supabase
        .from("orders_orderitems")
        .insert({
          selling_price: pricelistItems?.price,
          quantity: 1,
          commodity_id: validatedData.commodity_id,
          order_id: validatedData.order_id,
          buying_price: buyingPrice?.[0]?.buying_price || pricelistItems?.price,
          customer: response?.user?.id,
          delivery_date: validatedData.delivery_date
            ? new Date(validatedData.delivery_date)
            : new Date(),
          uom:
            validatedData.uom === "no_uom"
              ? commodityData?.quantity_unit
              : validatedData.uom,
        })
        .select("*")
        .single();

      if (newItemError) {
        return { error: newItemError.message };
      }

      if (validatedData.order_id) {
        await updateOrderTotal(supabase, validatedData.order_id);
      }

      revalidatePath("/orders/corporate/view/items");
      return {
        success: true,
        id: newItem?.id,
        selling_price: newItem?.selling_price,
        buying_price: newItem?.buying_price,
        quantity: newItem?.quantity,
        uom: newItem?.uom,
      };
    }

    // Handle item update
    const { data: updatedItem, error: updateError } = await supabase
      .from("orders_orderitems")
      .update({
        selling_price: pricelistItems?.price || validatedData.selling_price,
        buying_price:
          buyingPrice?.[0]?.buying_price ||
          pricelistItems?.price ||
          validatedData.buying_price,
        commodity_id: validatedData.commodity_id,
      })
      .eq("id", validatedData.item_id)
      .select("id, buying_price, selling_price, quantity, uom, commodity_id")
      .single();

    if (updateError) {
      return {
        error: updateError.message,
        source: "update",
      };
    }

    if (validatedData.order_id) {
      await updateOrderTotal(supabase, validatedData.order_id);
    }
    revalidatePath("/orders/corporate/view/items");
    return {
      success: true,
      id: updatedItem?.id,
      selling_price: updatedItem?.selling_price,
      buying_price: updatedItem?.buying_price,
      quantity: updatedItem?.quantity,
      uom: updatedItem?.uom,
    };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      source: "server",
    };
  }
}

export async function updateQty(fd: FormData) {
  const supabase = await createClient();

  const itemId = fd.get("item_id");
  const orderId = fd.get("order_id");
  const quantity = fd.get("quantity");

  if (!itemId || !orderId) {
    return { error: "Missing required fields" };
  }

  try {
    const { error } = await supabase
      .from("orders_orderitems")
      .update({
        quantity: quantity,
      })
      .eq("id", itemId);

    if (error) return { error: error };

    if (orderId) {
      await updateOrderTotal(supabase, orderId);
    }

    revalidatePath("/orders/corporate/view/items");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateUoM(uom: string, item_id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("orders_orderitems")
      .update({
        uom: uom,
      })
      .eq("id", item_id);

    if (error) return { error: error };

    revalidatePath("/orders/corporate/view/items");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateUnitCost(fd: FormData) {
  const supabase = await createClient();
  const itemId = fd.get("item_id");
  const orderId = fd.get("order_id");
  const buyingPrice = fd.get("buying_price");

  if (!itemId || !orderId) {
    return { error: "Missing required fields" };
  }

  try {
    const { error } = await supabase
      .from("orders_orderitems")
      .update({
        buying_price: buyingPrice,
      })
      .eq("id", itemId);

    if (error) return { error: error };

    if (orderId) {
      await updateOrderTotal(supabase, orderId);
    }

    revalidatePath("/orders/corporate/view/items");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateUnitPrice(fd: FormData) {
  const supabase = await createClient();
  const itemId = fd.get("item_id");
  const orderId = fd.get("order_id");
  const sellingPrice = fd.get("selling_price");

  if (!itemId || !orderId) {
    return { error: "Missing required fields" };
  }

  try {
    const { error } = await supabase
      .from("orders_orderitems")
      .update({
        selling_price: sellingPrice,
      })
      .eq("id", itemId);

    if (error) return { error: error };

    if (orderId) {
      await updateOrderTotal(supabase, orderId);
    }

    revalidatePath("/orders/corporate/view/items");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const deleteItem = async (item_id: string, order_id: string) => {
  const supabase = await createClient();

  let { error }: any = await supabase
    .from("orders_orderitems")
    .delete()
    .eq("id", item_id);

  if (!error) {
    if (order_id) {
      await updateOrderTotal(supabase, order_id);
    }

    return {
      success: true,
    };
  }

  return {
    error: error,
  };
};
