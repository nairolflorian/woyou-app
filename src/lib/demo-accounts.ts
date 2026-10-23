// Single source of truth for demo account metadata.
// Used by /demo (test page) and the floating Demo-Mode bar.
// Weg 1: nur Rollen, die zum Modell passen: Backoffice (Unterlagen-Service) und Kund:innen.
// Keine Firmen- und keine Vermittler-Rollen (Arbeitgeberbereich und Vermittlung abgeschaltet).

export type DemoAccount = {
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "TEAM" | "CANDIDATE";
  /** frühere Adresse desselben Demo-Kontos (ältere Seeds), wird beim Demo-Login mit akzeptiert */
  aliases?: string[];
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
    email: "backoffice@woyou.demo",
    aliases: ["vermittler@woyou.demo"],
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
    description: "Kundin · Pflege · DE B1 · Startpaket bezahlt, Werkzeug aktiv, 3 Beispielstellen",
    next: "/profil",
    emoji: "👩‍⚕️",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    email: "youssef@example.com",
    role: "CANDIDATE",
    name: "Youssef El Amrani",
    description: "Kunde · Koch · DE A2 · Startpaket bezahlt, Werkzeug aktiv",
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
