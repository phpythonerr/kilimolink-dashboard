"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("orders_order")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath(`/orders/corporate/view?id=${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Failed to update order status" };
  }
}

export async function updatePaymentStatus(
  orderId: string,
  payment_status: string
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("orders_order")
      .update({ payment_status })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath(`/orders/corporate/view?id=${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { error: "Failed to update payment status" };
  }
}
