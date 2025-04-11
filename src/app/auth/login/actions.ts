"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SignInSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .refine((email) => email.endsWith("@kilimolink.com"), {
      message: "Sorry, you're not allowed to access this service",
    }),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

export const signIn = async (formData: FormData) => {
  try {
    const validatedFields = SignInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0].message,
      };
    }

    const { email, password } = validatedFields.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    if (data?.user?.user_metadata?.user_type !== "staff") {
      await supabase.auth.signOut();
      return {
        success: true,
        redirect: "/auth/login",
        message: "Invalid Login Credentials",
      };
    }

    const { data: mfa, error: mfaError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    return {
      success: true,
      mfa: mfa,
      redirect: "/dashboard",
      message: "Login successful. You will be redirected shortly",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to sign in",
    };
  }
};

export const signOut = async () => {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      redirect: "/auth/login",
      message: "Successfully logged out",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign out",
    };
  }
};
