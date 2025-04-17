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

const DeletePurchaseSchema = z.object({
  purchaseId: z.string().min(1, "Purchase ID is required"),
});

const UpdatePurchaseSchema = z.object({
  purchaseId: z.string().min(1, "Purchase ID is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  productId: z.string().min(1, "Product is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  paymentTerms: z.string().min(1, "Payment terms is required"),
  productUoM: z.string().min(1, "Product UoM is required"),
  sellerType: z.string().min(1, "Seller type is required"),
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

export async function deletePurchase(formData: FormData) {
  try {
    const validatedFields = DeletePurchaseSchema.safeParse({
      purchaseId: formData.get("purchaseId"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0].message };
    }

    const supabase = await createClient();

    // Check if the purchase exists
    const { data: purchase, error: fetchError } = await supabase
      .from("inventory_purchases")
      .select()
      .eq("id", validatedFields.data.purchaseId)
      .single();

    if (fetchError) {
      return { error: "Purchase record not found" };
    }

    // Delete the purchase record
    const { error: deleteError } = await supabase
      .from("inventory_purchases")
      .delete()
      .eq("id", validatedFields.data.purchaseId);

    if (deleteError) {
      throw new Error("Failed to delete purchase record");
    }

    revalidatePath("/accounting/expenses/purchases");
    return { success: true };
  } catch (error) {
    console.error("Delete purchase error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete purchase record",
    };
  }
}

export async function updatePurchase(formData: FormData) {
  try {
    const validatedFields = UpdatePurchaseSchema.safeParse({
      purchaseId: formData.get("purchaseId"),
      vendorId: formData.get("vendorId"),
      productId: formData.get("productId"),
      unitPrice: formData.get("unitPrice"),
      quantity: formData.get("quantity"),
      purchaseDate: formData.get("purchaseDate"),
      paymentTerms: formData.get("paymentTerms"),
      productUoM: formData.get("productUoM"),
      sellerType: formData.get("sellerType"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0].message };
    }

    const supabase = await createClient();

    // Check if the purchase exists
    const { data: purchase, error: fetchError } = await supabase
      .from("inventory_purchases")
      .select()
      .eq("id", validatedFields.data.purchaseId)
      .single();

    if (fetchError) {
      return { error: "Purchase record not found" };
    }

    // Update the purchase record
    const { error: updateError } = await supabase
      .from("inventory_purchases")
      .update({
        seller_id: validatedFields.data.vendorId,
        product_id: validatedFields.data.productId,
        unit_price: parseFloat(validatedFields.data.unitPrice),
        quantity: parseFloat(validatedFields.data.quantity),
        purchase_date: validatedFields.data.purchaseDate,
        payment_terms: validatedFields.data.paymentTerms,
        product_uom: validatedFields.data.productUoM,
        seller_type: validatedFields.data.sellerType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedFields.data.purchaseId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update purchase record");
    }

    revalidatePath("/accounting/expenses/purchases");
    return { success: true };
  } catch (error) {
    console.error("Update purchase error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update purchase record",
    };
  }
}
