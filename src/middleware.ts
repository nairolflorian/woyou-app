// Sets HTTP security headers on every response.
//
// In production we use a nonce-based CSP: Next.js picks up `x-nonce` from
// the request headers and automatically tags its own runtime scripts with
// it. Inline scripts we control (Schema.org JSON-LD on the landing page)
// read the nonce from next/headers and add it themselves.
//
// In development we relax script-src to allow Next's HMR / Turbopack
// machinery (`'unsafe-inline'` + `'unsafe-eval'`).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

export function middleware(req: NextRequest) {
  // Generate one nonce per request.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = [
    "default-src 'self'",
    scriptSrc,
    // Style-src stays loose: Next.js + Tailwind 4 inline some critical CSS.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
