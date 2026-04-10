import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = new Set(["/login", "/signup"]);

export function middleware(req: NextRequest) {
  const hasAccessToken = Boolean(req.cookies.get("accessToken")?.value);
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(hasAccessToken ? "/dashboard" : "/login", req.url),
    );
  }

  const isAuthPage = AUTH_PAGES.has(pathname);

  if (!hasAccessToken && !isAuthPage) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasAccessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};