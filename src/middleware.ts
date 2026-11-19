import { NextResponse, type NextRequest } from "next/server";

const REFRESH_COOKIE = "refresh_token";

/**
 * Edge route protection. Runs before any protected page renders: no session
 * cookie -> straight to /login (no flash of protected UI). The cookie's
 * validity is still verified by the API on the first refresh call.
 */
export function middleware(req: NextRequest) {
  if (req.cookies.has(REFRESH_COOKIE)) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  const next = req.nextUrl.pathname + req.nextUrl.search;
  if (next !== "/") loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/doctors/:path*", "/patients/:path*"],
};
