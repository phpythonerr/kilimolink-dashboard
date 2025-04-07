"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RejectPaymentSchema = z.object({
  paymentId: z.string().min(1),
  note: z.string().optional(),
});

interface Purchase {
  id: string;
  unit_price: number;
  quantity: number;
  product_id: string;
  vendor: string;
  seller_type: string;
  created_date: string;
  paid_amount: number;
  balance: number;
  payment_status: "Unpaid" | "Partially-Paid" | "Paid";
  updated_at: string;
  payment_updated_at: string;
}

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
    const purchaseUpdates: Purchase[] = purchases
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
  source_of_funds: z.string().min(1, "Source of funds is required"),
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

    // Sort purchases by date, oldest first (FIFO)
    const purchases = payment.inventory_purchasepaymentrelation
      .map((relation: any) => ({
        ...relation.purchase,
        payment_amount: relation.amount || 0,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.payment_updated_at || 0).getTime() -
          new Date(b.payment_updated_at || 0).getTime()
      );

    let remainingAmount = payment.amount;
    const purchaseUpdates = [];

    // Process purchases from oldest to newest
    for (const purchase of purchases) {
      if (remainingAmount <= 0) break;

      const totalAmount =
        Number(purchase.unit_price) * Number(purchase.quantity);
      const amountToApplyForThisPurchase = Math.min(
        purchase.payment_amount,
        remainingAmount
      );

      const currentPaidAmount = Number(purchase.paid_amount || 0);
      const newPaidAmount = currentPaidAmount + amountToApplyForThisPurchase;
      const newBalance = Math.max(0, totalAmount - newPaidAmount);

      remainingAmount -= amountToApplyForThisPurchase;

      purchaseUpdates.push({
        id: purchase.id,
        unit_price: purchase.unit_price,
        quantity: purchase.quantity,
        product_id: purchase.product_id,
        vendor: purchase.vendor,
        seller_type: purchase.seller_type,
        created_date: purchase.created_date,
        paid_amount: newPaidAmount,
        balance: newBalance,
        payment_status:
          newPaidAmount <= 0
            ? "Unpaid"
            : newBalance > 0
            ? "Partially-Paid"
            : "Paid",
        updated_at: new Date().toISOString(),
        payment_updated_at: new Date().toISOString(),
      });
    }

    // Begin transaction-like operations
    const { error: purchasesError } = await supabase
      .from("inventory_purchases")
      .upsert(purchaseUpdates);

    if (purchasesError) throw new Error("Failed to update purchases");

    // Update payment status
    const { error: updateError } = await supabase
      .from("finance_payment")
      .update({
        status: "Approved",
        note: validatedFields.data.note,
        source_of_funds: validatedFields.data.source_of_funds,
        approval_datetime: new Date().toISOString(),
        approved_by: "current-user-id", // TODO: Replace with actual user ID
      })
      .eq("id", validatedFields.data.paymentId);

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
