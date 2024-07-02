import { cookies } from "next/headers";
import type { MiddlewareConfig, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "./env";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const sessionCookie = cookies().get(
    env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  );

  // console.log(sessionCookie);

  if (!sessionCookie) return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config: MiddlewareConfig = {
  matcher: ["/chat/:path*"],
};
