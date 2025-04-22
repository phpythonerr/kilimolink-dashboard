"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Define types for clarity
interface Order {
  id: string;
  order_number: string;
  branch: string | null;
  delivery_date: string;
  // Reference the user ID directly
  user: string | null; // Assuming user column holds the profile ID
  // Nested profile data
  profiles: {
    business_name: string | null;
  } | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  fulfilled: boolean;
  commodity_id: string; // Changed from product_id
  // Updated relationship name and structure based on commodity_id
  commodities_commodity: {
    // Changed from inventory_commodity
    name: string;
  } | null;
}

/**
 * Fetches orders scheduled for delivery on a specific date (today or tomorrow).
 */
export async function getOrdersByDeliveryDate(
  deliveryDateOption: "today" | "tomorrow"
): Promise<Order[]> {
  const supabase = await createClient();
  const targetDate = new Date();
  if (deliveryDateOption === "tomorrow") {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  const targetDateString = targetDate.toISOString().split("T")[0];

  // Join profiles based on the 'user' column in orders_orders matching 'id' in profiles
  const { data: orders, error } = await supabase
    .from("orders_order")
    .select(
      `
      id,
      order_number,
      branch,
      delivery_date,
      user, 
      profiles:user ( business_name )
    `
    )
    .eq("delivery_date", targetDateString)
    .order("created", { ascending: true });

  if (error) {
    console.error("Error fetching orders by delivery date:", error);
    return [];
  }

  // Ensure profiles is not null, provide a default if needed
  return orders.map((order: any) => ({
    ...order,
    profiles: order.profiles ?? { business_name: "Unknown Business" },
  })) as Order[];
}

/**
 * Fetches order items for a specific order ID, sorted by commodity name.
 */
export async function getOrderItemsByOrderId(
  orderId: string
): Promise<OrderItem[]> {
  if (!orderId) return []; // Return empty if no orderId is provided
  const supabase = await createClient();

  const { data: orderItems, error: itemsError } = await supabase
    .from("orders_orderitems")
    .select(
      `
      id,
      quantity,
      fulfilled,
      commodity_id, 
      commodities_commodity:commodity_id ( name )
    `
    )
    .eq("order_id", orderId)
    // Order by the name within the related commodities_commodity table
    .order("name", {
      referencedTable: "commodities_commodity",
      ascending: true,
    });

  if (itemsError) {
    console.error("Error fetching order items:", itemsError);
    return [];
  }

  // Ensure commodities_commodity is not null
  return orderItems.map((item: any) => ({
    ...item,
    commodities_commodity: item.commodities_commodity ?? {
      name: "Unknown Product",
    },
  })) as OrderItem[];
}

/**
 * Toggles the fulfillment status of an order item and updates inventory using RPC.
 */
export async function toggleFulfillment(
  orderItemId: string,
  commodityId: string,
  quantity: number,
  currentFulfilledStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const newFulfilledStatus = !currentFulfilledStatus;

  // Get current user ID
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { success: false, error: "Could not authenticate user." };
  }
  const performedById = user.id;

  try {
    // Determine transaction details based on the action (fulfill or unfulfill)
    // changeQuantity is negative for sale (fulfillment), positive for return (unfulfillment)
    const changeQuantity = newFulfilledStatus ? -quantity : quantity;
    const transactionType = newFulfilledStatus ? "sale" : "return";
    const notes = newFulfilledStatus
      ? `Order Item Fulfillment: ${orderItemId}`
      : `Order Item Returned: ${orderItemId}`;

    // 1. Check stock ONLY if fulfilling
    if (newFulfilledStatus) {
      // Fetch commodity name first
      const { data: commodityInfo, error: commodityFetchError } = await supabase
        .from("commodities_commodity")
        .select("name")
        .eq("id", commodityId)
        .single();

      if (commodityFetchError) {
        throw new Error(
          `Failed to fetch commodity details for ID ${commodityId}: ${commodityFetchError.message}`
        );
      }
      const commodityName = commodityInfo?.name ?? `ID ${commodityId}`;

      // Fetch current inventory quantity from inventory_commodity
      const { data: inventoryData, error: inventoryFetchError } = await supabase
        .from("inventory_commodity") // Correct table for quantity
        .select("quantity")
        .eq("id", commodityId)
        .single(); // Assuming one inventory record per commodity

      if (inventoryFetchError) {
        // Handle cases where inventory record might not exist yet
        if (inventoryFetchError.code === "PGRST116") {
          // code for 'single row not found'
          return {
            success: false,
            error: `No inventory record found for ${commodityName}. Cannot fulfill.`,
          };
        }
        throw new Error(
          `Failed to fetch current inventory for ${commodityName}: ${inventoryFetchError.message}`
        );
      }

      const currentInventoryQuantity = inventoryData?.quantity ?? 0;

      if (currentInventoryQuantity < quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${commodityName}. Available: ${currentInventoryQuantity}, Needed: ${quantity}`,
        };
      }
    }

    // 2. Call the RPC function to update inventory and log ledger
    const { error: rpcError } = await supabase.rpc("update_inventory", {
      p_commodity_id: commodityId,
      p_change_quantity: changeQuantity, // Pass the signed quantity
      p_transaction_type: transactionType, // Keep type for potential logging/categorization in RPC
      p_reference_id: orderItemId, // Use order item ID as reference
      p_notes: notes,
      p_performed_by: performedById,
    });

    if (rpcError) {
      console.error("Error calling update_inventory RPC:", rpcError);
      // Attempt to provide a more specific error message if possible
      const errorMessage = rpcError.message.includes("check constraint")
        ? `Inventory update failed: ${rpcError.details || rpcError.message}` // e.g., insufficient stock detected by DB constraint
        : `Failed to update inventory via RPC: ${rpcError.message}`;
      throw new Error(errorMessage);
    }

    // 3. Update the order item status in orders_orderitems
    const { error: orderItemUpdateError } = await supabase
      .from("orders_orderitems")
      .update({ fulfilled: newFulfilledStatus })
      .eq("id", orderItemId);

    if (orderItemUpdateError) {
      // NOTE: Reverting the RPC call is complex. Ideally, the RPC function
      // itself should handle atomicity or provide a compensating action.
      // For now, we log the error and inform the user.
      console.error(
        "Failed to update order item status after successful inventory update:",
        orderItemUpdateError
      );
      throw new Error(
        `Inventory updated, but failed to update order item status: ${orderItemUpdateError.message}. Please check manually.`
      );
    }

    // Revalidate relevant paths if needed (e.g., if displaying inventory elsewhere)
    // revalidatePath('/inventory');
    revalidatePath("/store/sales/record"); // Revalidate the current page

    return { success: true };
  } catch (error) {
    console.error("Toggle fulfillment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
