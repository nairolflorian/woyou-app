import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { computeCompleteness, deriveStatus } from "@/lib/candidate";
import type { CandidateStatus } from "@/lib/enums";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  countryOfResidence: z.string().optional(),
  city: z.string().optional(),
  preferredChannel: z.string().optional(),
  telegramHandle: z.string().optional(),
  whatsappNumber: z.string().optional(),
  desiredJobCategory: z.string().optional(),
  desiredJobTitle: z.string().optional(),
  alternativeJobs: z.array(z.string()).optional(),
  educationLevel: z.string().optional(),
  yearsExperience: z.coerce.number().int().nonnegative().optional(),
  currentJob: z.string().optional(),
  currentEmployer: z.string().optional(),
  drivingLicense: z.boolean().optional(),
  willingnessToRelocate: z.boolean().optional(),
  preferredCities: z.array(z.string()).optional(),
  earliestStart: z.string().optional(),
  expectedSalaryMin: z.coerce.number().int().nonnegative().optional(),
  expectedSalaryMax: z.coerce.number().int().nonnegative().optional(),
  germanLevel: z.string().optional(),
  englishLevel: z.string().optional(),
  otherLanguages: z.array(z.object({ lang: z.string(), level: z.string() })).optional(),
  aboutMe: z.string().optional(),
  motivation: z.string().optional(),
  familyStatus: z.string().optional(),
  dependents: z.coerce.number().int().nonnegative().optional(),
  consentMode: z.enum(["BLANKET", "PER_COMPANY"]).optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
  });
  if (!candidate) {
    return NextResponse.json({ error: "NO_CANDIDATE" }, { status: 404 });
  }

  const update: Record<string, unknown> = { ...data };
  if (data.dateOfBirth) update.dateOfBirth = new Date(data.dateOfBirth);
  if (data.earliestStart) update.earliestStart = new Date(data.earliestStart);
  if (data.alternativeJobs) update.alternativeJobs = JSON.stringify(data.alternativeJobs);
  if (data.preferredCities) update.preferredCities = JSON.stringify(data.preferredCities);
  if (data.otherLanguages) update.otherLanguages = JSON.stringify(data.otherLanguages);

  const merged = { ...candidate, ...update } as typeof candidate;
  const completeness = computeCompleteness(merged);
  const status = deriveStatus(merged, candidate.status as CandidateStatus);

  const saved = await prisma.candidate.update({
    where: { id: candidate.id },
    data: { ...update, profileCompleteness: completeness, status },
  });

  return NextResponse.json({ ok: true, candidate: saved, completeness, status });
}
