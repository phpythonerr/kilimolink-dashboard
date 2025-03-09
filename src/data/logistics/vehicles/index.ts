"use server";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export async function getVehicles() {
  const supabase = await createClient();

  let { data, error }: any = await supabase
    .from("vehicles_vehicle")
    .select("*")
    .order("registration");

  if (error) return { error: error };

  return data;
}
