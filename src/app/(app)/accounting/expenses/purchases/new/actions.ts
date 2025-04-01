"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const FormSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  productId: z.string().min(1, "Product is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  paymentTerms: z.string().min(1, "Payment terms is required"),
  productUoM: z.string().min(1, "Product UoM is required"),
  paymentStatus: z.string().min(1, "Payment Status is required"),
});

type PurchaseInput = z.infer<typeof FormSchema>;

export async function createPurchase(formData: FormData) {
  const supabase = await createClient();
  try {
    const vendorId = formData.get("vendorId");
    const productId = formData.get("productId");
    const unitPrice = formData.get("unitPrice");
    const quantity = formData.get("quantity");
    const purchaseDate = formData.get("purchaseDate");
    const paymentTerms = formData.get("paymentTerms");
    const productUoM = formData.get("productUoM");
    const paymentStatus = formData.get("paymentStatus");

    // Validate required fields
    if (
      !vendorId ||
      !productId ||
      !unitPrice ||
      !quantity ||
      !purchaseDate ||
      !paymentTerms ||
      !productUoM ||
      !paymentStatus
    ) {
      return { error: "Missing required fields" };
    }

    // Get individual values from FormData
    const data: PurchaseInput = {
      vendorId: vendorId?.toString(),
      productId: productId?.toString(),
      unitPrice: unitPrice?.toString(),
      quantity: quantity?.toString(),
      purchaseDate: purchaseDate?.toString(),
      paymentTerms: paymentTerms?.toString(),
      productUoM: productUoM?.toString(),
      paymentStatus: paymentStatus?.toString(),
    };

    // Validate the data
    const validatedData = FormSchema.parse(data);

    const { data: purchase, error } = await supabase
      .from("inventory_purchases")
      .insert({
        vendor: validatedData.vendorId,
        product_id: validatedData.productId,
        unit_price: validatedData.unitPrice,
        quantity: validatedData.quantity,
        purchase_date: validatedData.purchaseDate,
        payment_terms: validatedData.paymentTerms,
        product_uom: validatedData.productUoM,
        payment_status: validatedData?.paymentStatus,
      });

    if (error) return { error: error.message };

    return { success: true };
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
  return;
}
