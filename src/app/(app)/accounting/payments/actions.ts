"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RejectPaymentSchema = z.object({
  paymentId: z.string().min(1),
  note: z.string().optional(),
});

export async function rejectPayment(formData: FormData) {
  try {
    const validatedFields = RejectPaymentSchema.safeParse({
      paymentId: formData.get("paymentId"),
      note: formData.get("note"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0].message };
    }

    const supabase = await createClient();

    // Get payment details and associated purchases
    const { data: payment, error: paymentError } = await supabase
      .from("finance_payment")
      .select(
        `
        *,
        purchases: inventory_purchases (
          id,
          payment_status,
          paid_amount,
          balance,
          unit_price,
          quantity
        )
      `
      )
      .eq("id", validatedFields.data.paymentId)
      .single();

    if (paymentError) throw new Error("Failed to fetch payment details");

    // Start transaction
    const purchaseUpdates = payment.purchases.map((purchase: any) => {
      const newPaidAmount = purchase.paid_amount - payment.amount;
      const totalAmount = purchase.unit_price * purchase.quantity;
      const newBalance = totalAmount - newPaidAmount;

      return {
        id: purchase.id,
        paid_amount: Math.max(0, newPaidAmount), // Ensure paid amount doesn't go negative
        balance: Math.max(0, newBalance),
        payment_status:
          newPaidAmount <= 0
            ? "Unpaid"
            : newBalance > 0
            ? "Partially-Paid"
            : "Paid",
        payment_id: null,
        updated_at: new Date().toISOString(),
      };
    });

    // Update purchases
    const { error: purchasesError } = await supabase
      .from("inventory_purchases")
      .upsert(purchaseUpdates);

    if (purchasesError) throw new Error("Failed to update purchases");

    // Update payment status
    const { error: updateError } = await supabase
      .from("finance_payment")
      .update({
        status: "Rejected",
        note: validatedFields.data.note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedFields.data.paymentId);

    if (updateError) throw new Error("Failed to update payment status");

    revalidatePath("/accounting/payments");
    return { success: true };
  } catch (error) {
    console.error("Payment rejection failed:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to reject payment",
    };
  }
}
