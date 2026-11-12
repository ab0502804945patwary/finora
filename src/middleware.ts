import { NextResponse, type NextRequest } from "next/server";

const VERIFY_URL = (process.env.NEXT_PUBLIC_VERIFY_URL || "http://everify.localhost:3000").replace(/\/$/, "");

const isVerifyHost = (host: string) => host.toLowerCase().startsWith("everify.");

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname, search } = req.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isInternalVerify = pathname === "/v" || pathname.startsWith("/v/");

  if (isVerifyHost(host)) {
    // everify.finoraca.com/...  ->  /v/...  (admin + api pass through)
    if (isAdmin || isInternalVerify || pathname.startsWith("/api/")) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/v" : `/v${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Main domain: send verification + admin traffic to the subdomain
  if (isAdmin || isInternalVerify || pathname.startsWith("/audit/")) {
    const path = isInternalVerify ? pathname.slice(2) || "/" : pathname;
    return NextResponse.redirect(`${VERIFY_URL}${path}${search}`);
  }
  return NextResponse.next();
}

export const config = {
  // skip Next internals and any static file (path containing a dot)
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
