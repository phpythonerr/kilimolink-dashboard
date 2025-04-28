"use server";

import { createClient } from "@/lib/supabase/admin/server";
import { revalidatePath } from "next/cache";
import { CustomerSchema, CustomerFormData } from "./schemas"; // Import from schemas.ts

export async function registerCustomer(formData: CustomerFormData) {
  // Already async
  const validation = CustomerSchema.safeParse(formData);

  if (!validation.success) {
    // Consider returning specific error messages
    console.error("Validation Error:", validation.error.flatten());
    return {
      success: false,
      message: "Invalid form data.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    firstName,
    lastName,
    email,
    phone,
    businessName,
    businessType,
    deliveryAddress,
    kraPinNumber,
    priceCategory, // This is the ID (uuid) from commodities_pricelist
    paymentTerms,
    invoiceBankAccount, // This is the ID (uuid) from finance_account
    hasCommission,
    commissionType,
    commissionAmount,
    enabledCategories, // Array of category IDs (uuid)
  } = validation.data;

  try {
    // --- User Creation (Example using Supabase Auth) ---
    // You might have a different user creation flow (e.g., invite, manual password)
    // This is a basic example assuming you create the user directly
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true, // Automatically confirm the email
        password: Math.random().toString(36).slice(-10), // Generate a random temporary password
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          business_name: businessName,
          business_type: businessType,
          delivery_address: deliveryAddress,
          kra_pin_number: kraPinNumber,
          pricelist: priceCategory, // Store the pricelist ID
          price_category: priceCategory, // Store the pricelist ID
          payment_terms: paymentTerms,
          bank_account: invoiceBankAccount, // Store the finance_account ID
          has_commission: hasCommission,
          commission_type: hasCommission ? commissionType : null,
          commission_amount: hasCommission ? commissionAmount : null,
          enabled_categories: enabledCategories,
          user_type: "buyer",
          status: "active",
          exempted_items: [],
          location_verified: true,
          verification_document: false,
        },
      });

    if (authError) {
      console.error("Auth Error:", authError);
      // Provide more specific feedback if possible (e.g., email already exists)
      return {
        success: false,
        message: `Failed to create user: ${authError.message}`,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: "User creation did not return a user object.",
      };
    }

    const userId = authData.user.id;

    await supabase.rpc("sync_user_data"); // this will sync user data with profiles table

    // Revalidate path to update lists/caches if necessary
    revalidatePath("/users/customers/corporate");

    console.log("Registered User ID:", userId);

    return { success: true, message: "Customer registered successfully!" };
  } catch (error) {
    console.error("Unexpected Error:", error);
    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}
