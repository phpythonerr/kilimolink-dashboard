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
        paid_amount:
          validatedData.paymentStatus === "Partially-Paid"
            ? Number(validatedData.paidAmount)
            : validatedData.paymentStatus === "Paid"
            ? Number(validatedData.unitPrice) * Number(validatedData.quantity)
            : 0,
        balance:
          validatedData.paymentStatus === "Paid"
            ? 0
            : validatedData.paymentStatus === "Partially-Paid"
            ? Number(validatedData.unitPrice) * Number(validatedData.quantity) -
              Number(validatedData.paidAmount)
            : Number(validatedData.unitPrice) * Number(validatedData.quantity),
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    await updateInventoryQuantity({
      commodityId: validatedData.productId,
      changeQuantity: validatedData.quantity,
      transactionType: "purchase",
      referenceId: purchase?.id,
      notes: `Purchase from ${validatedData.vendorId}`,
    });

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

export const updateInventoryQuantity = async ({
  commodityId,
  changeQuantity,
  transactionType = "adjustment",
  referenceId = null,
  notes = null,
}: {
  commodityId: string;
  changeQuantity: number;
  transactionType?: string;
  referenceId?: string | null;
  notes?: string | null;
}) => {
  const supabase = await createClient();

  try {
    // Call the update_inventory function
    const { error } = await supabase.rpc("update_inventory", {
      p_commodity_id: commodityId,
      p_change_quantity: changeQuantity,
      p_transaction_type: transactionType,
      p_reference_id: referenceId,
      p_notes: notes,
      p_performed_by: supabase.auth.getUser()?.data?.user?.id,
    });

    if (error) {
      console.error("Error updating inventory:", error);
      throw error;
    }

    return { commodityId };
  } catch (error) {
    console.error(
      `Error in updateInventoryQuantity for ${commodityId}:`,
      error
    );
    throw error;
  }
};
