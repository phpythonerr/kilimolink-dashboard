"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const PaymentSchema = z.object({
  amount: z.string().transform((val) => {
    const amount = Number(val);
    if (isNaN(amount) || amount <= 0 || amount > 999999) {
      throw new Error("Invalid amount");
    }
    return amount;
  }),
  payment_type: z.enum(["full", "partial"]),
  vendor_id: z.string().min(1, "Vendor ID is required"),
  purchases: z.string().transform((val) => {
    try {
      const purchases = JSON.parse(val);
      // Validate the parsed purchases array
      if (!Array.isArray(purchases) || purchases.length === 0) {
        throw new Error("Invalid purchases data");
      }
      // Validate each purchase object
      purchases.forEach((purchase: any) => {
        if (
          !purchase.unit_price ||
          !purchase.quantity ||
          !purchase.created_date
        ) {
          throw new Error("Invalid purchase data structure");
        }
      });
      return purchases;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Invalid purchases data"
      );
    }
  }),
});

export async function initiatePayment(formData: FormData) {
  try {
    // Validate form data
    const validatedFields = PaymentSchema.safeParse({
      amount: formData.get("amount"),
      payment_type: formData.get("payment_type"),
      vendor_id: formData.get("vendor_id"),
      purchases: formData.get("purchases"),
    });

    if (!validatedFields.success) {
      return {
        error: "Invalid form data: " + validatedFields.error.errors[0].message,
      };
    }

    const { amount, payment_type, vendor_id, purchases } = validatedFields.data;

    // Additional business logic validations
    if (payment_type === "partial") {
      const totalUnpaid = purchases.reduce(
        (acc: number, item: any) => acc + item.unit_price * item.quantity,
        0
      );
      if (amount >= totalUnpaid) {
        return {
          error: `Partial payment (${amount}) must be less than total amount (${totalUnpaid})`,
        };
      }
    }

    // Create Supabase client
    const supabase = await createClient();

    const sortedPurchases = purchases.sort(
      (a: any, b: any) =>
        new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
    );

    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from("finance_payment")
      .insert({
        amount,
        status: "Pending",
        date_initiated: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (paymentError) throw new Error("Failed to create payment record");

    let remainingAmount = amount;

    const purchaseUpdates = [];

    const updatedPurchases = [];

    // Process purchases from oldest to newest
    for (const purchase of sortedPurchases) {
      const purchaseAmount = purchase.unit_price * purchase.quantity;

      if (remainingAmount <= 0) break;

      let updateData: any = {
        payment_id: payment.id,
        updated_at: new Date().toISOString(),
      };

      if (remainingAmount >= purchaseAmount) {
        // Full payment for this purchase
        updateData.payment_status = "Paid";
        updateData.paid_amount = purchaseAmount;
        updateData.balance = 0;
        remainingAmount -= purchaseAmount;
      } else {
        // Partial payment for this purchase
        updateData.payment_status = "Partially-Paid";
        updateData.paid_amount = remainingAmount;
        updateData.balance = purchaseAmount - remainingAmount;
        remainingAmount = 0;
      }

      purchaseUpdates.push({
        promise: supabase
          .from("inventory_purchases")
          .update(updateData)
          .eq("id", purchase.id),
        purchase,
        updateData,
      });
    }

    // Execute all updates and track results
    const results = await Promise.allSettled(
      purchaseUpdates.map((update) => update.promise)
    );

    // Identify failed updates
    const failedUpdates = results.reduce((acc: any[], result, index) => {
      if (
        result.status === "rejected" ||
        (result.status === "fulfilled" && result.value.error)
      ) {
        acc.push({
          purchase: purchaseUpdates[index].purchase,
          error:
            result.status === "rejected" ? result.reason : result.value.error,
        });
      }
      return acc;
    }, []);

    // If any updates failed, attempt to reconcile
    if (failedUpdates.length > 0) {
      // Rollback payment status
      await supabase
        .from("finance_payment")
        .update({
          status: "Failed",
          error_log: JSON.stringify({
            failed_purchases: failedUpdates.map((f) => f.purchase.id),
            error_messages: failedUpdates.map((f) => f.error.message),
          }),
        })
        .eq("id", payment.id);

      // Log the failures for admin review
      await supabase.from("finance_payment_failures").insert(
        failedUpdates.map((failure) => ({
          payment_id: payment.id,
          purchase_id: failure.purchase.id,
          error_message: failure.error.message,
          attempted_update: failure.updateData,
          created_at: new Date().toISOString(),
        }))
      );

      throw new Error(
        `Failed to update ${failedUpdates.length} purchases. Payment marked as failed.`
      );
    }

    // All updates successful - mark payment as completed
    await supabase
      .from("finance_payment")
      .update({ status: "Pending" })
      .eq("id", payment.id);

    revalidatePath(`/users/vendors/view?id=${vendor_id}`);
    return { success: true };
  } catch (error) {
    console.error("Payment initiation failed:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to initiate payment",
    };
  }
}
