import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";

// Define allowed organization domains
const ALLOWED_EMAIL_DOMAINS = ["kilimolink.com"];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth/login"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
