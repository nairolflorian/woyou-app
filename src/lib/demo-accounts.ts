// Single source of truth for demo account metadata.
// Used by /demo (test page) and the floating Demo-Mode bar.

export type DemoAccount = {
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "COMPANY" | "CANDIDATE";
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
    description: "Voller Backend-Zugriff. Kann andere Vermittler:innen anlegen.",
    next: "/admin",
    emoji: "🛡",
    color: "from-rose-500 to-rose-700",
  },
  {
    email: "vermittler@woyou.demo",
    role: "ADMIN",
    name: "Vermittler:in",
    description: "Backoffice: Kandidaten verwalten, Matches vorschlagen, Aufgaben tracken.",
    next: "/admin",
    emoji: "🎯",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    email: "hr@klinik-berlin.demo",
    role: "COMPANY",
    name: "Klinik Berlin",
    description: "Unternehmen, das Pflegekräfte sucht. Sieht freigegebene Kandidaten.",
    next: "/firmen/dashboard",
    emoji: "🏥",
    color: "from-cyan-500 to-cyan-700",
  },
  {
    email: "jobs@hotel-alpenhof.demo",
    role: "COMPANY",
    name: "Hotel Alpenhof",
    description: "Unternehmen mit Standard- und Sonder-Stellenanfrage.",
    next: "/firmen/dashboard",
    emoji: "🏨",
    color: "from-teal-500 to-teal-700",
  },
  {
    email: "fatima@example.com",
    role: "CANDIDATE",
    name: "Fatima Benali",
    description: "Kandidatin · Pflege · DE B1 · vermittelbar (Pauschal-Freigabe)",
    next: "/profil",
    emoji: "👩‍⚕️",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    email: "youssef@example.com",
    role: "CANDIDATE",
    name: "Youssef El Amrani",
    description: "Kandidat · Koch · DE A2 · vermittelbar (Einzel-Freigabe)",
    next: "/profil",
    emoji: "👨‍🍳",
    color: "from-amber-500 to-amber-700",
  },
  {
    email: "aicha@example.com",
    role: "CANDIDATE",
    name: "Aicha Tazi",
    description: "Kandidatin · Elektrikerin · Profil noch unvollständig, nicht bezahlt.",
    next: "/profil",
    emoji: "👷‍♀️",
    color: "from-slate-500 to-slate-700",
  },
];

export const DEMO_MODE_ENABLED =
  process.env.DEMO_MODE !== "false";
