"use server";
import { createClient } from "@/lib/supabase/admin/server";
import { cache } from "react";

export async function getVehicles(id: string) {
  const supabase = await createClient();

  let { data: order, error }: any = await supabase
    .from("vehicles_vehicle")
    .select("*")
    .order("registration");

  if (error) return { error: error };

  return order;
}
