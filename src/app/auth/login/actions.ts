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

  if (data?.user?.user_metadata?.status === "pending-approval") {
    return {
      success: true,
      redirect: "/pending-approval",
      message: "Account pending approval",
    };
  } else {
    const { data: mfa, error: mfaError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    let redirect: string;
    if (data?.user?.user_metadata?.user_type === "staff") {
      redirect = "https://staff.kilimolink.com";
    } else {
      redirect = `/app/${data?.user?.user_metadata?.user_type}`;
    }
    return {
      success: true,
      mfa: mfa,
      redirect: redirect,
      message: "Login successful. You will be redirected shortly",
    };
  }
};
