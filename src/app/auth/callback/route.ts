import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Helper function to get the base URL from the request
function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Get the current base URL
  const baseUrl = getBaseUrl(request);
  console.log("Auth callback handler using base URL:", baseUrl);

  if (code) {
    const supabase = await createClient();

    try {
      // Exchange the auth code for a session
      await supabase.auth.exchangeCodeForSession(code);

      // Check if the user has staff status
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (
        session?.user.user_metadata?.user_type !== "staff" &&
        !session?.user.email?.endsWith("@kilimolink.com")
      ) {
        // If not a staff member, sign them out
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${baseUrl}/auth/login?error=access_denied`
        );
      }

      // Success - redirect to the dashboard using absolute URL
      return NextResponse.redirect(`${baseUrl}/dashboard`);
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=server_error`);
    }
  }

  // If no code is present, redirect to login
  return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`);
}
