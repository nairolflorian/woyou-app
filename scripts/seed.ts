import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ANGEBOT, addMonths } from "../src/lib/angebot";
import { DEMO_JOBS, demoJobRow } from "../src/lib/demo-jobs";

const prisma = new PrismaClient();

async function main() {
  // Schutz: Der Seed löscht ALLE Daten. Nie in der Produktion (DEMO_MODE=false, woyou.de) ausführen.
  if (process.env.DEMO_MODE === "false") {
    console.error("Abbruch: DEMO_MODE=false (Produktion). Der Seed löscht alle Daten und läuft nur in Staging/lokal.");
    process.exit(1);
  }
  console.log("Seeding…");
  await prisma.notification.deleteMany();
  await prisma.adminTask.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.jobRequest.deleteMany();
  await prisma.languageTestAnswer.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const pwd = await bcrypt.hash("woyou1234", 10);

  // Admins
  const superAdmin = await prisma.user.create({
    data: { email: "admin@woyou.demo", passwordHash: pwd, role: "SUPER_ADMIN", locale: "de" },
  });
  await prisma.user.create({
    data: { email: "backoffice@woyou.demo", passwordHash: pwd, role: "ADMIN", locale: "de" },
  });
  await prisma.user.create({
    data: { email: "team@woyou.demo", passwordHash: pwd, role: "TEAM", locale: "de" },
  });

  // Weg 1: keine Firmenkonten, keine Stellenanfragen von Firmen (Arbeitgeberbereich und Matching abgeschaltet)

  // Three sample candidates from Morocco
  const candidates = [
    {
      email: "fatima@example.com",
      first: "Fatima",
      last: "Benali",
      cat: "krankenpfleger",
      german: "B1",
      exp: 4,
      city: "Casablanca",
      paid: true,
      consent: "BLANKET" as const,
      score: 11,
    },
    {
      email: "youssef@example.com",
      first: "Youssef",
      last: "El Amrani",
      cat: "koch",
      german: "A2",
      exp: 6,
      city: "Marrakesch",
      paid: true,
      consent: "PER_COMPANY" as const,
      score: 8,
    },
    {
      email: "aicha@example.com",
      first: "Aicha",
      last: "Tazi",
      cat: "elektrotechnik",
      german: "A1",
      exp: 2,
      city: "Rabat",
      paid: false,
      consent: "PER_COMPANY" as const,
      score: 5,
    },
  ];

  for (const c of candidates) {
    const u = await prisma.user.create({
      data: { email: c.email, passwordHash: pwd, role: "CANDIDATE", locale: "fr" },
    });
    const cand = await prisma.candidate.create({
      data: {
        userId: u.id,
        firstName: c.first,
        lastName: c.last,
        dateOfBirth: new Date("1995-01-01"),
        gender: "female",
        nationality: "Marokkanisch",
        countryOfResidence: "Marokko",
        city: c.city,
        preferredChannel: "TELEGRAM",
        desiredJobCategory: c.cat,
        desiredJobTitle: c.cat === "krankenpfleger" ? "Pflegefachkraft Klinik" : c.cat === "koch" ? "Koch traditionelle Küche" : "Industrieelektriker:in",
        alternativeJobs: JSON.stringify([]),
        educationLevel: "apprenticeship",
        yearsExperience: c.exp,
        currentJob: c.cat,
        currentEmployer: "Lokaler Betrieb",
        drivingLicense: true,
        willingnessToRelocate: true,
        preferredCities: JSON.stringify(["Berlin", "München"]),
        earliestStart: new Date("2026-09-01"),
        expectedSalaryMin: 2500,
        expectedSalaryMax: 3500,
        germanLevel: c.german,
        englishLevel: "B1",
        otherLanguages: JSON.stringify([{ lang: "Arabisch", level: "C2" }, { lang: "Französisch", level: "C1" }]),
        languageTestScore: c.score,
        languageTestPassed: c.score >= 6,
        languageTestTakenAt: new Date(),
        aboutMe:
          c.first === "Fatima"
            ? "Erfahrene Pflegefachkraft mit OP-Erfahrung, sehr motiviert für einen Neuanfang in Deutschland."
            : c.first === "Youssef"
              ? "Koch mit Leidenschaft für regionale Küchen, internationale Hotelerfahrung."
              : "Junge Elektrikerin, schnell lernend, sucht Ausbildung mit Übernahme.",
        motivation:
          "Ich möchte meine Karriere in einem strukturierten Markt aufbauen und langfristig in Deutschland leben.",
        familyStatus: "single",
        dependents: 0,
        consentMode: c.consent,
        profileCompleteness: 100,
        status: c.paid ? "PAID_PLACEABLE" : "INCOMPLETE",
        paidAt: c.paid ? new Date() : null,
        // Weg 1: bezahlte Demo-Kund:innen haben das Werkzeug aus dem Startpaket aktiv (3 Monate ab heute)
        toolAccessUntil: c.paid ? addMonths(new Date(), ANGEBOT.startpaket.toolMonths) : null,
      },
    });
    if (c.paid) {
      const now = new Date();
      await prisma.serviceBooking.create({
        data: {
          candidateId: cand.id, packageKey: "startpaket", amountCents: ANGEBOT.startpaket.priceCents, applicationsGoal: 0,
          toolMonths: ANGEBOT.startpaket.toolMonths, contactPhone: "+212 600 000 000", targetJobs: c.cat === "krankenpfleger" ? "Pflegefachkraft" : "Koch",
          targetRegions: "Nordrhein-Westfalen", acceptedTermsAt: now, waiverAcceptedAt: now, status: "PAID", paidAt: now,
          adminNote: "Demo-Buchung aus dem Seed, keine echte Zahlung",
        },
      });
    }
    // Fatima: drei erfundene Beispielstellen im Tracker (Anschreiben zum „beworben“-Beispiel ergänzt der Demo-Login)
    if (c.email === "fatima@example.com") {
      for (const j of DEMO_JOBS) await prisma.savedJob.create({ data: { candidateId: cand.id, ...demoJobRow(j) } });
    }
  }

  // One sample admin task
  await prisma.adminTask.create({
    data: {
      kind: "VERIFICATION",
      title: "Reisepass von Aicha Tazi prüfen",
      description: "Foto wurde via Telegram zugesandt, bitte Echtheit checken.",
      status: "OPEN",
      assignedToId: superAdmin.id,
    },
  });

  // Sync the JobCategory table from src/lib/jobs.ts (single source of truth).
  const { JOB_CATEGORIES } = await import("../src/lib/jobs");
  await prisma.jobCategory.deleteMany();
  await prisma.jobCategory.createMany({
    data: JOB_CATEGORIES.map((j) => ({
      slug: j.slug,
      group: j.group,
      nameDe: j.de,
      nameEn: j.en,
      nameFr: j.fr,
      nameAr: j.ar,
    })),
  });

  console.log("Done.\n\nDemo accounts (Passwort: woyou1234):");
  console.log("  Super-Admin   admin@woyou.demo");
  console.log("  Admin         backoffice@woyou.demo");
  console.log("  Team          team@woyou.demo");
  console.log("  Kandidat 1    fatima@example.com  (Werkzeug aktiv, 3 Beispielstellen)");
  console.log("  Kandidat 2    youssef@example.com (Werkzeug aktiv)");
  console.log("  Kandidat 3    aicha@example.com");
}

main().finally(() => prisma.$disconnect());
