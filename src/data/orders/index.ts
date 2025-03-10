"use server";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export async function getOrder(id: string) {
  const supabase = await createClient();

  let { data, error }: any = await supabase
    .from("orders_order")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { error: error };

  return data;
}

export async function getOrdersList() {
  const supabase = await createClient();

  let { data, error }: any = await supabase
    .from("orders_order")
    .select("*")
    .order("delivery_date", { ascending: false });

  if (error) return { error: error };

  return data;
}
