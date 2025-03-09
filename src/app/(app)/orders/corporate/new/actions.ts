"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

const FormSchema = z.object({
  customerId: z.string(),
  subsidiary: z.string(),
  po_number: z.string(),
  dateCreated: z.string(),
  deliveryDate: z.string(),
});

type OrderInput = z.infer<typeof FormSchema>;

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const hasPerm = await hasPermission("orders.corporate.create");

  // if (!hasPerm) {
  //   return { error: "You don't have permission to create a corporate order" };
  // }

  try {
    // Get individual values from FormData
    const data = {
      customerId: formData.get("customerId"),
      subsidiary: formData.get("subsidiary"),
      po_number: formData.get("po_number"),
      dateCreated: formData.get("dateCreated"),
      deliveryDate: formData.get("deliveryDate"),
    } as OrderInput;

    // Validate the data
    const validatedData = FormSchema.parse(data);

    let { data: newOrder, error: newOrderError }: any = await supabase
      .from("orders_order")
      .insert({
        user: validatedData?.customerId,
        total: 0,
        delivery_date: new Date(validatedData?.deliveryDate),
        region: "",
        notes: "",
        created: new Date(validatedData?.dateCreated),
        payment_status: "Unpaid",
        status: "Processing",
        contact_person_name: "",
        contact_person_phone: "",
        po_number: validatedData?.po_number,
        branch: validatedData?.subsidiary,
      })
      .select("id")
      .single();

    console.log(newOrder);

    console.log(newOrderError);

    if (newOrderError) {
      return {
        error: newOrderError.message,
      };
    }

    return { success: true, id: newOrder?.id };
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return { error: error.message };
    }
    return { error: JSON.stringify(error) };
  }
}
