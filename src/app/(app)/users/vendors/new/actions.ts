"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/admin/server";

const FormSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  tradeName: z.string().optional().nullable(),
  phoneNumber: z
    .string()
    .min(1, "Phone Number is required")
    .transform((val) => {
      // Remove all spaces and non-numeric characters
      const cleaned = val.replace(/\D/g, "");
      // Get last 9 digits
      const last9 = cleaned.slice(-9);
      // Add country code
      return `254${last9}`;
    }),
  location: z.string().min(1, "Location is required"),
});

type VendorInput = z.infer<typeof FormSchema>;

export async function createVendor(formData: FormData) {
  const supabase = await createClient();
  try {
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const tradeName = formData.get("tradeName");
    const phoneNumber = formData.get("phoneNumber");
    const location = formData.get("location");

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !location) {
      return { error: "Missing required fields" };
    }

    // Get individual values from FormData
    const data: VendorInput = {
      firstName: firstName?.toString(),
      lastName: lastName?.toString(),
      tradeName: tradeName?.toString(),
      phoneNumber: phoneNumber?.toString(),
      location: location?.toString(),
    };

    // Validate the data
    const validatedData = FormSchema.parse(data);

    const { data: user, error } = await supabase.auth.admin.createUser({
      phone: validatedData.phoneNumber,
      password: `${validatedData?.lastName}${validatedData?.phoneNumber}`,
      user_metadata: {
        user_type: "vendor",
        firstName: validatedData?.firstName,
        lastName: validatedData?.lastName,
        tradeName: validatedData?.tradeName,
        location: validatedData?.location,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
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
