"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUser } from "@/data/users";
import { z } from "zod";

const RejectPaymentSchema = z.object({
  paymentId: z.string().min(1),
  note: z.string().min(1, "Note is required when rejecting payment"),
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
      inventory_purchasepaymentrelation (
        amount,
        purchase: inventory_purchases (*)
      )
    `
      )
      .eq("id", validatedFields.data.paymentId)
      .single();

    if (paymentError) throw new Error("Failed to fetch payment details");

    // Sort purchases by date, newest first
    const purchases = payment.inventory_purchasepaymentrelation
      .map((relation: any) => ({
        ...relation.purchase,
        payment_amount: relation.amount || 0, // Ensure amount is never null
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.payment_updated_at || 0).getTime() -
          new Date(a.payment_updated_at || 0).getTime()
      );

    let remainingAmountToReverse = payment.amount;

    // Process purchases from newest to oldest
    const purchaseUpdates: any = purchases
      .map((purchase: any) => {
        if (remainingAmountToReverse <= 0) return null;

        const totalAmount = purchase.unit_price * purchase.quantity;
        const amountToReverseForThisPurchase = Math.min(
          purchase.payment_amount, // Use the amount from relation
          remainingAmountToReverse
        );

        const newPaidAmount =
          purchase.paid_amount - amountToReverseForThisPurchase;
        const newBalance = totalAmount - newPaidAmount;

        remainingAmountToReverse -= amountToReverseForThisPurchase;

        return {
          id: purchase.id, // Required for upsert
          unit_price: purchase.unit_price,
          quantity: purchase.quantity,
          product_id: purchase.product_id,
          vendor: purchase.vendor,
          seller_type: purchase.seller_type,
          created_date: purchase.created_date,
          paid_amount: Math.max(0, newPaidAmount),
          balance: newBalance || 0,
          payment_status:
            newPaidAmount <= 0
              ? "Unpaid"
              : newBalance > 0
              ? "Partially-Paid"
              : "Paid",
          updated_at: new Date().toISOString(),
          payment_updated_at: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    // Begin transaction
    const { error: purchasesError } = await supabase
      .from("inventory_purchases")
      .upsert(purchaseUpdates);

    if (purchasesError) throw new Error("Failed to update purchases");

    // Delete the payment relations
    const { error: relationsError } = await supabase
      .from("inventory_purchasepaymentrelation")
      .delete()
      .eq("payment_id", validatedFields.data.paymentId);

    if (relationsError) throw new Error("Failed to remove payment relations");

    // Update payment status
    const { error: updateError } = await supabase
      .from("finance_payment")
      .update({
        status: "Rejected",
        note: validatedFields.data.note,
        approval_datetime: new Date().toISOString(),
      })
      .eq("id", validatedFields.data.paymentId);

    if (updateError) throw new Error("Failed to update payment status");

    revalidatePath("/accounting/payments");
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to reject payment",
    };
  }
}

const ApprovePaymentSchema = z.object({
  paymentId: z.string().min(1),
  note: z.string().optional(),
  source_of_funds: z
    .string()
    .min(1, "Source of funds is required to approve payment"),
});

export async function approvePayment(formData: FormData) {
  try {
    const validatedFields = ApprovePaymentSchema.safeParse({
      paymentId: formData.get("paymentId"),
      note: formData.get("note"),
      source_of_funds: formData.get("source_of_funds"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0].message };
    }

    const supabase = await createClient();

    const user = await getUser();

    if (!user) {
      return { error: "User not found" };
    }

    // TODO: Call payment function. Either mpesa or bank. Once successful, mark as approved

    // Update payment status only
    const { error: updateError } = await supabase
      .from("finance_payment")
      .update({
        status: "Approved",
        note: validatedFields.data.note,
        source_of_funds: validatedFields.data.source_of_funds,
        approval_datetime: new Date().toISOString(),
        approved_by: user?.id,
      })
      .eq("id", validatedFields.data.paymentId);

    console.log(updateError);

    if (updateError) throw new Error("Failed to update payment status");

    revalidatePath("/accounting/payments");
    return { success: true };
  } catch (error) {
    console.error("Approval error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to approve payment",
    };
  }
}
