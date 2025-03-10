"use server";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export async function getRevenueTypes() {
  const supabase = await createClient();

  let { data, error }: any = await supabase
    .from("finance_revenuetype")
    .select("*")
    .order("name");

  if (error) return { error: error };

  return data;
}
