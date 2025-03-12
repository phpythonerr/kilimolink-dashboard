"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const revenueSchema = z.object({
  revenueType: z.string().min(1, "Revenue type is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "Amount must be greater than 0"),
  deliveryDate: z
    .string()
    .min(1, "Date is required")
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), "Invalid date"),
  vat_rule: z.string().optional(),
  invoiceable: z.boolean().default(false),
  orderID: z.string().optional(),
  description: z.string().optional(),
});

type RevenueInput = z.infer<typeof revenueSchema>;

export async function createRevenue(formData: FormData) {
  try {
    const supabase = await createClient();

    // Validate user permissions
    const {
      data: { user: me },
    } = await supabase.auth.getUser();
    if (!me?.user_metadata?.permissions?.includes("can_create_expense")) {
      return {
        success: false,
        error: "You don't have permission to create revenues",
        code: "PERMISSION_ERROR",
      };
    }

    // Extract and validate form data
    const validatedData = revenueSchema.parse({
      revenueType: formData.get("revenueType"),
      amount: formData.get("amount"),
      deliveryDate: formData.get("deliveryDate"),
      vat_rule: formData.get("vatRule"),
      invoiceable: formData.get("invoiceable") === "true",
      orderID: formData.get("orderID"),
      description: formData.get("description"),
    });

    // Insert validated data
    const { data, error } = await supabase
      .from("finance_revenue")
      .insert({
        revenue_type_id: validatedData.revenueType,
        amount: validatedData.amount,
        date: validatedData.deliveryDate.toISOString(),
        reference: null,
        invoiceable: validatedData.invoiceable,
        vat_rule: validatedData.vat_rule || null,
        order_id: validatedData.invoiceable ? validatedData.orderID : null,
        description: validatedData.description || null,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path.join("."),
        code: "VALIDATION_ERROR",
      };
    }

    console.error("Revenue creation failed:", error);
    return {
      success: false,
      error: "Failed to create revenue",
      code: "INTERNAL_ERROR",
    };
  }
}
