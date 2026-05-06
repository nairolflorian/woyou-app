// In-memory rate limiter, keyed by IP + bucket.
// Sized for a single Node process (the only setup we have on the server).
// Not Redis-backed because we don't run multi-instance.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

// LRU-ish cleanup: every now and then prune expired entries.
let lastCleanup = Date.now();
function maybeCleanup() {
  if (Date.now() - lastCleanup < 60_000) return;
  lastCleanup = Date.now();
  const now = Date.now();
  for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetIn: number;
};

export function rateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  maybeCleanup();
  const k = `${bucket}:${key}`;
  const now = Date.now();
  const cur = store.get(k);
  if (!cur || cur.resetAt < now) {
    store.set(k, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetIn: windowMs };
  }
  cur.count++;
  if (cur.count > limit) {
    return { ok: false, remaining: 0, resetIn: cur.resetAt - now };
  }
  return { ok: true, remaining: limit - cur.count, resetIn: cur.resetAt - now };
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
