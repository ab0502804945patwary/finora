import { NextResponse, type NextRequest } from "next/server";

const strip = (u: string) => u.replace(/\/$/, "");
const SITE_URL = strip(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
const VERIFY_URL = strip(process.env.NEXT_PUBLIC_VERIFY_URL || "http://everify.localhost:3000");

/*
 * One app, two sites chosen by host name:
 *   finoraca.com           company website + admin panel at /admin
 *   everify.finoraca.com   public document verification (internal routes /v/*)
 * The public verification host never serves the admin panel.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname, search } = req.nextUrl;

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
  const isVerifyPath = pathname === "/v" || pathname.startsWith("/v/");
  const isAuditPath = pathname.startsWith("/audit/");

  // Verification host
  if (host.startsWith("everify.")) {
    if (isAdminPath) return NextResponse.redirect(`${SITE_URL}${pathname}${search}`);
    if (isVerifyPath || pathname.startsWith("/api/")) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/v" : `/v${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Main website host: serves the site and /admin, sends verification pages to the verify host
  if (isVerifyPath || isAuditPath) {
    const path = isVerifyPath ? pathname.slice(2) || "/" : pathname;
    return NextResponse.redirect(`${VERIFY_URL}${path}${search}`);
  }
  return NextResponse.next();
}

export const config = {
  // skip Next internals and any static file (path containing a dot)
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
