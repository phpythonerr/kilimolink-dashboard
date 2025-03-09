"use server";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export async function getExpenseTypes() {
  const supabase = await createClient();

  let { data: order, error }: any = await supabase
    .from("finance_expensetype")
    .select("*")
    .order("name");

  if (error) return { error: error };

  return order;
}
