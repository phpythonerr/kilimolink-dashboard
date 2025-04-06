"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const FormSchema = z
  .object({
    sellerType: z.string().min(1, "Seller Type is required"),
    vendorId: z.string().min(1, "Vendor is required"),
    productId: z.string().min(1, "Product is required"),
    unitPrice: z.string().min(1, "Unit price is required"),
    quantity: z.string().min(1, "Quantity is required"),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    paymentTerms: z.string().min(1, "Payment terms is required"),
    productUoM: z.string().min(1, "Product UoM is required"),
    paymentStatus: z.string().min(1, "Payment Status is required"),
    paidAmount: z.string().optional(),
    balance: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentStatus === "Partially-Paid") {
        const amount = Number(data.paidAmount);
        const total = Number(data.unitPrice) * Number(data.quantity);
        return amount > 0 && amount < total;
      }
      return true;
    },
    {
      message: "Paid amount must be greater than 0 and less than total amount",
      path: ["paidAmount"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.paymentStatus === "Partially-Paid" && !data.paidAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid amount is required for partially paid purchases",
        path: ["paidAmount"],
      });
    }
  });

type PurchaseInput = z.infer<typeof FormSchema>;

export async function createPurchase(formData: FormData) {
  const supabase = await createClient();
  try {
    const sellerType = formData.get("sellerType");
    const vendorId = formData.get("vendorId");
    const productId = formData.get("productId");
    const unitPrice = formData.get("unitPrice");
    const quantity = formData.get("quantity");
    const purchaseDate = formData.get("purchaseDate");
    const paymentTerms = formData.get("paymentTerms");
    const productUoM = formData.get("productUoM");
    const paymentStatus = formData.get("paymentStatus");
    const paidAmount = formData.get("paidAmount");
    const balance = formData.get("balance");

    // Validate required fields
    if (
      !vendorId ||
      !productId ||
      !unitPrice ||
      !quantity ||
      !purchaseDate ||
      !paymentTerms ||
      !productUoM ||
      !paymentStatus ||
      !sellerType
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
      sellerType: sellerType?.toString(),
      paidAmount: paidAmount?.toString(),
      balance: balance ? balance.toString() : undefined,
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
        seller_type: validatedData?.sellerType,
        paid_amount: validatedData?.paidAmount,
        balance:
          validatedData?.balance === undefined
            ? Number(validatedData.unitPrice) *
              parseFloat(validatedData.quantity)
            : Number(
                Number(validatedData.unitPrice) *
                  parseFloat(validatedData.quantity)
              ) - Number(validatedData.paidAmount || 0),
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
