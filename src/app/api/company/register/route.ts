import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserWithRole } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { JOB_CATEGORIES } from "@/lib/jobs";
import { autoMatchForJobRequest } from "@/lib/auto-match";

const schema = z.object({
  account: z
    .object({ email: z.string().email(), password: z.string().min(6) })
    .nullable()
    .optional(),
  company: z.object({
    companyName: z.string().min(1),
    contactName: z.string().optional(),
    industry: z.string().optional(),
    city: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
    description: z.string().optional(),
  }),
  jobRequest: z.object({
    jobCategory: z.string(),
    customJobTitle: z.string().nullable().optional(),
    description: z.string().optional(),
    requiredGermanLevel: z.string().optional(),
    minYearsExperience: z.coerce.number().int().nonnegative().optional(),
    salaryMin: z.coerce.number().int().nonnegative().nullable().optional(),
    salaryMax: z.coerce.number().int().nonnegative().nullable().optional(),
    location: z.string().optional(),
  }),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { account, company, jobRequest } = parsed.data;

  const session = await getSession();
  let userId = session.userId;

  if (!userId) {
    if (!account) {
      return NextResponse.json({ error: "ACCOUNT_REQUIRED" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({
      where: { email: account.email },
    });
    if (existing) {
      return NextResponse.json({ error: "ALREADY_REGISTERED" }, { status: 409 });
    }
    const user = await createUserWithRole(
      { email: account.email, password: account.password, locale: "de" },
      ROLE.COMPANY
    );
    userId = user.id;
    session.userId = user.id;
    session.role = ROLE.COMPANY;
    session.email = account.email;
    await session.save();
  }

  // Did this user already register a company? Update; else create.
  const existingCompany = await prisma.company.findUnique({
    where: { userId: userId! },
  });

  const created = existingCompany
    ? await prisma.company.update({
        where: { id: existingCompany.id },
        data: { ...company, website: company.website || undefined },
      })
    : await prisma.company.create({
        data: { userId: userId!, ...company, website: company.website || undefined },
      });

  const isCustomRequest =
    !JOB_CATEGORIES.find((c) => c.slug === jobRequest.jobCategory) ||
    jobRequest.jobCategory === "__custom__";

  const newJobRequest = await prisma.jobRequest.create({
    data: {
      companyId: created.id,
      jobCategory: jobRequest.jobCategory || "__custom__",
      customJobTitle: jobRequest.customJobTitle ?? undefined,
      description: jobRequest.description ?? undefined,
      requiredGermanLevel: jobRequest.requiredGermanLevel ?? undefined,
      minYearsExperience: jobRequest.minYearsExperience ?? undefined,
      salaryMin: jobRequest.salaryMin ?? undefined,
      salaryMax: jobRequest.salaryMax ?? undefined,
      location: jobRequest.location ?? undefined,
      isCustomRequest,
    },
  });

  // Notify all admins
  const admins = await prisma.user.findMany({
    where: { role: { in: [ROLE.ADMIN, ROLE.SUPER_ADMIN] } },
  });
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: isCustomRequest ? "JOB_REQUEST_CUSTOM" : "JOB_REQUEST_NEW",
      title: isCustomRequest
        ? `Sonderanfrage von ${created.companyName}`
        : `Neue Stellenanfrage: ${created.companyName}`,
      body: jobRequest.customJobTitle ?? jobRequest.jobCategory,
      link: "/admin/anfragen",
    })),
  });

  // Auto-match against all currently placeable candidates (skips custom requests).
  if (!isCustomRequest) {
    await autoMatchForJobRequest(newJobRequest.id).catch((err) =>
      console.error("auto-match failed:", err)
    );
  }

  return NextResponse.json({ ok: true, next: "/firmen/dashboard" });
}
