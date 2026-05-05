import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import type { Role } from "@/lib/enums";

export type SessionData = {
  userId?: string;
  role?: Role;
  email?: string;
  locale?: string;
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_PASSWORD ??
    "woyou-demo-secret-please-change-me-32-characters-long-x",
  cookieName: "woyou_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function getSession() {
  const c = await cookies();
  return getIronSession<SessionData>(c, sessionOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return session;
}
