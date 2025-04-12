"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MarkAsPaidSchema = z.object({
  purchaseId: z.string().min(1, "Purchase ID is required"),
  paymentMode: z.enum(["mpesa", "bank", "cash"], {
    required_error: "Please select a payment mode",
  }),
  transactionCode: z.string().optional(),
});

export async function markAsPaid(formData: FormData) {
  try {
    const validatedFields = MarkAsPaidSchema.safeParse({
      purchaseId: formData.get("purchaseId"),
      paymentMode: formData.get("paymentMode"),
      transactionCode: formData.get("transactionCode"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0].message };
    }

    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("inventory_purchases")
      .update({
        payment_status: "Paid",
        source_of_funds: validatedFields.data.paymentMode,
        transaction_code: validatedFields.data.transactionCode || null,
        updated_at: new Date().toISOString(),
        payment_updated_at: new Date().toISOString(),
      })
      .eq("id", validatedFields.data.purchaseId);

    if (updateError) throw new Error("Failed to update purchase status");

    revalidatePath("/accounting/expenses/purchases");
    return { success: true };
  } catch (error) {
    console.error("Mark as paid error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark purchase as paid",
    };
  }
}
