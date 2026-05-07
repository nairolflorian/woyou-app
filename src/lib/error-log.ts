// Lightweight server-side error capture. Failures here must NOT throw —
// the original handler's error is what matters.

import { prisma } from "@/lib/prisma";

export type CaptureContext = {
  level?: "ERROR" | "WARN";
  digest?: string;
  path?: string;
  method?: string;
  status?: number;
  userId?: string;
  userAgent?: string;
};

export async function captureError(
  err: unknown,
  ctx: CaptureContext = {}
): Promise<void> {
  try {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack ?? null : null;
    await prisma.errorLog.create({
      data: {
        level: ctx.level ?? "ERROR",
        message: message.slice(0, 4000),
        stack: stack?.slice(0, 8000) ?? null,
        digest: ctx.digest ?? null,
        path: ctx.path ?? null,
        method: ctx.method ?? null,
        status: ctx.status ?? null,
        userId: ctx.userId ?? null,
        userAgent: ctx.userAgent?.slice(0, 500) ?? null,
      },
    });
  } catch (loggingErr) {
    console.error("captureError write failed:", loggingErr);
  }
}

// Wraps a route handler so any uncaught error is captured before being
// rethrown. Use sparingly — most errors don't reach this because they
// hit framework boundaries first; the global error.tsx catches the rest
// with a digest we can correlate.
export function withCapture<Args extends unknown[], R>(
  handler: (req: Request, ...rest: Args) => Promise<R>
) {
  return async (req: Request, ...rest: Args): Promise<R> => {
    try {
      return await handler(req, ...rest);
    } catch (err) {
      await captureError(err, {
        path: new URL(req.url).pathname,
        method: req.method,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
      throw err;
    }
  };
}
