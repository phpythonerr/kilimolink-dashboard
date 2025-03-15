"use server";
import { createClient } from "@/lib/supabase/server";

export const signIn = async (formData: any) => {
  const email = formData.email as string;
  const password = formData.password as string;
  const supabase = await createClient();

  const { data, error }: any = await supabase.auth.signInWithPassword({
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
    redirect: "/",
    message: "Login successful. You will be redirected shortly",
  };
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
      redirect: "/login",
      message: "Successfully logged out",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign out",
    };
  }
};
