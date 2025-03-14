"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

const FormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  subsidiary: z.string().optional().nullable(),
  po_number: z.string().optional().nullable(),
  dateCreated: z.string().min(1, "Date created is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
});

type OrderInput = z.infer<typeof FormSchema>;

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  // const hasPerm = await hasPermission("orders.corporate.create");

  // if (!hasPerm) {
  //   return { error: "You don't have permission to create a corporate order" };
  // }

  try {
    const customerId = formData.get("customerId");
    const subsidiary = formData.get("subsidiary");
    const po_number = formData.get("po_number");
    const dateCreated = formData.get("dateCreated");
    const deliveryDate = formData.get("deliveryDate");

    // Validate required fields
    if (!customerId || !dateCreated || !deliveryDate) {
      return { error: "Missing required fields" };
    }

    // Get individual values from FormData
    const data: OrderInput = {
      customerId: customerId?.toString(),
      subsidiary: subsidiary?.toString() || null,
      po_number: po_number?.toString() || null,
      dateCreated: dateCreated?.toString(),
      deliveryDate: deliveryDate?.toString(),
    };

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

    if (newOrderError) {
      return {
        error: newOrderError.message,
      };
    }

    return { success: true, id: newOrder?.id };
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
}
