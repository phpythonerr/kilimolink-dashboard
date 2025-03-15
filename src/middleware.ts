import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";

// Define allowed organization domains
const ALLOWED_EMAIL_DOMAINS = ["kilimolink.com"];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth/login"];

export async function middleware(request: NextRequest) {
  await updateSession(request);

  const url = new URL(request.url);

  const pathname = url.pathname;

  let supabase = await createClient();

  let {
    data: { user },
  }: any = await supabase.auth.getUser();

  if (!user) {
    return Response.redirect(
      new URL(`/login?message=Please Login to Access this Page`, request.url)
    );
  } else {
    if (user?.user_metadata?.user_type !== "staff") {
      await supabase.auth.signOut();
      return Response.redirect(
        new URL("/login?message=Invalid Request", request.url)
      );
    }

    if (user?.user_metadata?.status !== "active") {
      return Response.redirect(new URL("/pending-approval", request.url));
    }
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
