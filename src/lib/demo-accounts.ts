// Single source of truth for demo account metadata.
// Used by /demo (test page) and the floating Demo-Mode bar.
// Weg 1: keine Firmenkonten mehr in der Demo (Arbeitgeberbereich abgeschaltet).

export type DemoAccount = {
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "TEAM" | "COMPANY" | "CANDIDATE";
  name: string;
  description: string;
  next: string;
  emoji: string;
  color: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@woyou.demo",
    role: "SUPER_ADMIN",
    name: "Super-Admin",
    description: "Voller Zugriff auf das Backoffice. Kann Teammitglieder anlegen.",
    next: "/admin",
    emoji: "🛡",
    color: "from-rose-500 to-rose-700",
  },
  {
    email: "vermittler@woyou.demo",
    role: "ADMIN",
    name: "Admin",
    description: "Backoffice: Buchungen, Mappen prüfen, Aufgaben.",
    next: "/admin",
    emoji: "🎯",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    email: "team@woyou.demo",
    role: "TEAM",
    name: "Unterlagen-Team",
    description: "Sieht nur Buchungen und Aufgaben: Bewerbungsmappen prüfen und korrigieren.",
    next: "/admin/buchungen",
    emoji: "📨",
    color: "from-sky-500 to-sky-700",
  },
  {
    email: "fatima@example.com",
    role: "CANDIDATE",
    name: "Fatima Benali",
    description: "Kundin · Pflege · DE B1 · bezahlt",
    next: "/profil",
    emoji: "👩‍⚕️",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    email: "youssef@example.com",
    role: "CANDIDATE",
    name: "Youssef El Amrani",
    description: "Kunde · Koch · DE A2 · bezahlt",
    next: "/profil",
    emoji: "👨‍🍳",
    color: "from-amber-500 to-amber-700",
  },
  {
    email: "aicha@example.com",
    role: "CANDIDATE",
    name: "Aicha Tazi",
    description: "Kundin · Elektrikerin · Profil noch unvollständig, nicht bezahlt.",
    next: "/profil",
    emoji: "👷‍♀️",
    color: "from-slate-500 to-slate-700",
  },
];

export const DEMO_MODE_ENABLED =
  process.env.DEMO_MODE !== "false";
