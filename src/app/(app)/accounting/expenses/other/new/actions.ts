"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Define the schema for expense data
const expenseSchema = z.object({
  expenseType: z.string().min(1, "Expense type is required"),
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
  txn_reference_code: z.string().min(1, "Transaction reference is required"),
  description: z.string().optional(),
  txnDate: z
    .string()
    .min(1, "Transaction date is required")
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), "Invalid transaction date"),
  object_identifier: z.string().optional(),
});

type ExpenseInput = z.infer<typeof expenseSchema>;

export async function createExpense(formData: FormData) {
  try {
    // Extract and validate form data
    const validatedData = expenseSchema.parse({
      expenseType: formData.get("expense_type"),
      amount: formData.get("amount"),
      deliveryDate: formData.get("deliveryDate"),
      txn_reference_code: formData.get("txn_reference_code"),
      description: formData.get("description"),
      txnDate: formData.get("txnDate"),
      object_identifier: formData.get("object_identifier"),
    });

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("finance_expense")
      .insert({
        expense_type_id: validatedData.expenseType,
        amount: validatedData.amount,
        date: validatedData.deliveryDate.toISOString(),
        txn_reference_code: validatedData.txn_reference_code,
        description: validatedData.description || null,
        txn_date: validatedData.txnDate.toISOString(),
        object_identifier: validatedData.object_identifier || null,
      })
      .select()
      .single();

    if (error) {
      return {
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
        error: firstError.message,
        field: firstError.path.join("."),
        code: "VALIDATION_ERROR",
      };
    }

    console.error("Expense creation failed:", error);
    return {
      error: "Failed to create expense",
      code: "INTERNAL_ERROR",
    };
  }
}
