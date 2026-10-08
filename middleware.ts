import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function shouldSkip(pathname: string): boolean {
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/.well-known")
  ) {
    return true;
  }
  return pathname.includes(".");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (shouldSkip(pathname) || pathname.endsWith("/")) return NextResponse.next();

  // NextURL remembers that this request had no trailing slash and strips it
  // again when the redirect is serialized, so Location would equal the
  // request path and the browser loops. A standard URL keeps the slash.
  // Canonical public URLs stay slash-terminated (`trailingSlash: true`).
  const destination = new URL(request.url);
  destination.pathname = `${pathname}/`;
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
