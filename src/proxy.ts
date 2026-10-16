import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
