"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { headers } from "next/headers";

// Validate login information (for future use if needed)
const SignInSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .refine((email) => email.endsWith("@kilimolink.com"), {
      message: "Sorry, you're not allowed to access this service",
    }),
});

// Helper function to get the current domain
async function getCurrentDomain() {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  } catch (error) {
    // Fallback to environment variable or default
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const supabase = await createClient();

    // Get the current domain dynamically
    const origin = await getCurrentDomain();
    const redirectTo = `${origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          // Request offline access for refresh tokens
          access_type: "offline",
          // Force consent screen to ensure user sees prompt
          prompt: "consent",
        },
      },
    });

    if (error) {
      return {
        error: error.message,
        url: null,
      };
    }

    // Return the URL that the client should redirect to
    return {
      url: data.url,
      error: null,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google",
      url: null,
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
