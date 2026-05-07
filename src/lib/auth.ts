import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ROLE, type Role } from "@/lib/enums";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createUserWithRole(
  data: {
    email?: string;
    phone?: string;
    telegramId?: string;
    password?: string;
    locale?: string;
    oauthProvider?: string;
  },
  role: Role
) {
  const passwordHash = data.password ? await hashPassword(data.password) : null;
  return prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      telegramId: data.telegramId,
      passwordHash,
      role,
      locale: data.locale ?? "de",
      oauthProvider: data.oauthProvider,
    },
  });
}

export async function findUserByLogin(login: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { phone: login }, { telegramId: login }],
      deletedAt: null,
    },
    include: { candidate: true, company: true },
  });
}

export function isAdmin(role?: string | null) {
  return role === ROLE.ADMIN || role === ROLE.SUPER_ADMIN;
}
