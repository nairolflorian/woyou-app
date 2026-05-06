import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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
    data: { email: "vermittler@woyou.demo", passwordHash: pwd, role: "ADMIN", locale: "de" },
  });

  // Two companies
  const compUserA = await prisma.user.create({
    data: { email: "hr@klinik-berlin.demo", passwordHash: pwd, role: "COMPANY", locale: "de" },
  });
  const companyA = await prisma.company.create({
    data: {
      userId: compUserA.id,
      companyName: "Klinik Berlin",
      industry: "Pflege",
      city: "Berlin",
      country: "DE",
      contactName: "Anna Schulz",
      description: "Akutkrankenhaus mit 600 Betten — sucht laufend Pflegekräfte aus dem Ausland.",
      verified: true,
    },
  });
  const compUserB = await prisma.user.create({
    data: { email: "jobs@hotel-alpenhof.demo", passwordHash: pwd, role: "COMPANY", locale: "de" },
  });
  const companyB = await prisma.company.create({
    data: {
      userId: compUserB.id,
      companyName: "Hotel Alpenhof",
      industry: "Hotellerie",
      city: "Garmisch-Partenkirchen",
      country: "DE",
      contactName: "Markus Hofer",
      description: "4*-Familienhotel sucht Köche und Servicekräfte.",
      verified: true,
    },
  });

  await prisma.jobRequest.create({
    data: {
      companyId: companyA.id,
      jobCategory: "krankenpfleger",
      description: "Examinierte Pflegefachkraft für Innere Station, Vollzeit.",
      requiredGermanLevel: "B1",
      minYearsExperience: 2,
      salaryMin: 3000,
      salaryMax: 3600,
      location: "Berlin",
    },
  });
  await prisma.jobRequest.create({
    data: {
      companyId: companyB.id,
      jobCategory: "koch",
      description: "Koch:in mit Erfahrung in alpenländischer Küche.",
      requiredGermanLevel: "A2",
      minYearsExperience: 3,
      salaryMin: 2800,
      salaryMax: 3400,
      location: "Garmisch-Partenkirchen",
    },
  });
  await prisma.jobRequest.create({
    data: {
      companyId: companyB.id,
      jobCategory: "__custom__",
      customJobTitle: "Hotelmanager-Trainee mit Französisch",
      description: "Wir suchen einen frankophonen Trainee für unsere Direktion.",
      requiredGermanLevel: "B2",
      minYearsExperience: 1,
      salaryMin: 2500,
      salaryMax: 3000,
      location: "Garmisch-Partenkirchen",
      isCustomRequest: true,
    },
  });

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
    await prisma.candidate.create({
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
      },
    });
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
  console.log("  Vermittler    vermittler@woyou.demo");
  console.log("  Firma A       hr@klinik-berlin.demo");
  console.log("  Firma B       jobs@hotel-alpenhof.demo");
  console.log("  Kandidat 1    fatima@example.com");
  console.log("  Kandidat 2    youssef@example.com");
  console.log("  Kandidat 3    aicha@example.com");
}

main().finally(() => prisma.$disconnect());
