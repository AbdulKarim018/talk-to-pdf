import { cookies } from "next/headers";
import type { MiddlewareConfig, NextRequest } from "next/server";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const sessionCookie = cookies().get("next-auth.session-token");

  if (!sessionCookie) return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config: MiddlewareConfig = {
  matcher: ["/chat/:path*"],
};
