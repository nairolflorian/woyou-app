// Sets HTTP security headers on every response.
// CSP intentionally allows Unsplash (the hero/employer images) and the
// Telegram brand color SVG isn't external — everything else is self.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CSP = [
  "default-src 'self'",
  // Next.js inlines small scripts and CSS during dev; allow them broadly.
  // For a stricter prod CSP we'd ship nonces, but this is good enough now.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", CSP);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // HSTS only sent over HTTPS
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return res;
}

export const config = {
  // Skip Next internals & static
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
