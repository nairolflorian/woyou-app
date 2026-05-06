// Mirrors woyou.de/berufe — 8 groups × 4 professions.
// "Sonderwunsch" is intentionally NOT in this list. Companies can still file
// a custom request via the form (handled separately, lands as admin task).

export type JobCategory = {
  slug: string;
  group: string;
  de: string;
  en: string;
  fr: string;
  ar: string;
};

export const JOB_CATEGORIES: JobCategory[] = [
  // 🏥 Pflege & Gesundheit
  { slug: "altenpfleger", group: "pflege", de: "Altenpfleger:in", en: "Elderly carer", fr: "Aide-soignant·e", ar: "مرافق رعاية المسنين" },
  { slug: "krankenpfleger", group: "pflege", de: "Krankenpfleger:in", en: "Nurse", fr: "Infirmier·ère", ar: "ممرض" },
  { slug: "mfa", group: "pflege", de: "Medizinische:r Fachangestellte:r", en: "Medical assistant", fr: "Assistant·e médical·e", ar: "مساعد طبي" },
  { slug: "physiotherapie", group: "pflege", de: "Physiotherapeut:in", en: "Physiotherapist", fr: "Kinésithérapeute", ar: "أخصائي علاج طبيعي" },

  // 🚚 Logistik & Transport
  { slug: "lager", group: "logistik", de: "Lagerarbeiter:in", en: "Warehouse worker", fr: "Magasinier·ère", ar: "عامل مستودع" },
  { slug: "logistikmeister", group: "logistik", de: "Logistikmeister:in", en: "Logistics supervisor", fr: "Chef·fe logistique", ar: "مشرف لوجستي" },
  { slug: "fahrer", group: "logistik", de: "Fahrer:in (LKW / PKW)", en: "Driver (truck / car)", fr: "Chauffeur·euse (PL / VL)", ar: "سائق (شاحنة / سيارة)" },
  { slug: "versand", group: "logistik", de: "Versandkoordinator:in", en: "Shipping coordinator", fr: "Coordinateur·trice expédition", ar: "منسق شحن" },

  // 👨‍🍳 Gastronomie & Hotellerie
  { slug: "koch", group: "gastro", de: "Koch / Köchin", en: "Chef / Cook", fr: "Cuisinier·ère", ar: "طاهٍ" },
  { slug: "kellner", group: "gastro", de: "Kellner:in", en: "Waiter / Waitress", fr: "Serveur·euse", ar: "نادل" },
  { slug: "hotelfach", group: "gastro", de: "Hotelfachfrau / -mann", en: "Hotel professional", fr: "Personnel hôtelier", ar: "موظف فندق" },
  { slug: "rezeption", group: "gastro", de: "Rezeptionist:in", en: "Receptionist", fr: "Réceptionniste", ar: "موظف استقبال" },

  // 💻 Technik & IT
  { slug: "softwareentwickler", group: "it", de: "Softwareentwickler:in", en: "Software developer", fr: "Développeur·euse logiciel", ar: "مطور برامج" },
  { slug: "sysadmin", group: "it", de: "IT-Systemadministrator:in", en: "IT systems administrator", fr: "Administrateur·trice systèmes", ar: "مدير أنظمة" },
  { slug: "webentwickler", group: "it", de: "Webentwickler:in", en: "Web developer", fr: "Développeur·euse web", ar: "مطور ويب" },
  { slug: "dba", group: "it", de: "Datenbankadministrator:in", en: "Database administrator", fr: "Administrateur·trice base de données", ar: "مدير قواعد بيانات" },

  // 🔨 Handwerk
  { slug: "elektrotechnik", group: "handwerk", de: "Elektrotechniker:in", en: "Electrician", fr: "Électricien·ne", ar: "كهربائي" },
  { slug: "installateur", group: "handwerk", de: "Klempner:in / Installateur:in", en: "Plumber / installer", fr: "Plombier·ère / installateur·trice", ar: "سباك" },
  { slug: "maler", group: "handwerk", de: "Maler:in und Lackierer:in", en: "Painter / varnisher", fr: "Peintre", ar: "دهان" },
  { slug: "zimmerer", group: "handwerk", de: "Zimmerer:in", en: "Carpenter", fr: "Charpentier·ère", ar: "نجار" },

  // 👶 Soziales & Erziehung
  { slug: "erzieher", group: "soziales", de: "Erzieher:in", en: "Educator", fr: "Éducateur·trice", ar: "مربٍ" },
  { slug: "kinderpfleger", group: "soziales", de: "Kinderpfleger:in", en: "Childcare worker", fr: "Auxiliaire de puériculture", ar: "مرافق أطفال" },
  { slug: "sozialarbeit", group: "soziales", de: "Sozialarbeiter:in", en: "Social worker", fr: "Travailleur·euse social·e", ar: "أخصائي اجتماعي" },
  { slug: "jugendleiter", group: "soziales", de: "Jugendleiter:in", en: "Youth worker", fr: "Animateur·trice jeunesse", ar: "قائد شباب" },

  // 🏗️ Bau & Industrie
  { slug: "bauarbeiter", group: "bau", de: "Bauarbeiter:in", en: "Construction worker", fr: "Ouvrier·ère du bâtiment", ar: "عامل بناء" },
  { slug: "fabrik", group: "bau", de: "Fabrikarbeiter:in", en: "Factory worker", fr: "Ouvrier·ère d'usine", ar: "عامل مصنع" },
  { slug: "schweisser", group: "bau", de: "Schweißer:in", en: "Welder", fr: "Soudeur·euse", ar: "لحّام" },
  { slug: "maschinenbediener", group: "bau", de: "Maschinenbediener:in", en: "Machine operator", fr: "Opérateur·trice de machine", ar: "مشغّل آلات" },

  // 🛍️ Einzelhandel & Service
  { slug: "verkauf", group: "handel", de: "Verkäufer:in", en: "Salesperson", fr: "Vendeur·euse", ar: "بائع" },
  { slug: "kassierer", group: "handel", de: "Kassierer:in", en: "Cashier", fr: "Caissier·ère", ar: "أمين صندوق" },
  { slug: "bestand", group: "handel", de: "Lagerbestandsverwaltung", en: "Inventory management", fr: "Gestion des stocks", ar: "إدارة المخزون" },
  { slug: "kundenservice", group: "handel", de: "Kundenservice-Spezialist:in", en: "Customer service specialist", fr: "Spécialiste service client", ar: "أخصائي خدمة عملاء" },
];

export const JOB_GROUPS: Record<
  string,
  { de: string; en: string; fr: string; ar: string; icon: string }
> = {
  pflege:    { de: "Pflege & Gesundheit",      en: "Care & health",            fr: "Santé & soins",                ar: "الرعاية والصحة",     icon: "🏥" },
  logistik:  { de: "Logistik & Transport",     en: "Logistics & transport",    fr: "Logistique & transport",       ar: "اللوجستيات والنقل",  icon: "🚚" },
  gastro:    { de: "Gastronomie & Hotellerie", en: "Hospitality",              fr: "Hôtellerie-restauration",      ar: "الضيافة والفنادق",   icon: "👨‍🍳" },
  it:        { de: "Technik & IT",             en: "Tech & IT",                fr: "Technique & informatique",     ar: "التكنولوجيا",        icon: "💻" },
  handwerk:  { de: "Handwerk",                 en: "Skilled trades",           fr: "Artisanat",                    ar: "الحرف اليدوية",      icon: "🔨" },
  soziales:  { de: "Soziales & Erziehung",     en: "Social & education",       fr: "Social & éducation",           ar: "العمل الاجتماعي",    icon: "👶" },
  bau:       { de: "Bau & Industrie",          en: "Construction & industry",  fr: "BTP & industrie",              ar: "البناء والصناعة",     icon: "🏗️" },
  handel:    { de: "Einzelhandel & Service",   en: "Retail & service",         fr: "Commerce & service",           ar: "التجزئة والخدمة",     icon: "🛍️" },
};

// Marker for the "no fit in catalogue" path. NOT a real category — handled
// separately as a custom request that creates an admin task.
export const CUSTOM_JOB_SLUG = "__custom__";

export function jobLabel(slug: string, locale: string = "de"): string {
  if (slug === CUSTOM_JOB_SLUG) return "Sonderanfrage / anderer Beruf";
  const job = JOB_CATEGORIES.find((j) => j.slug === slug);
  if (!job) return slug;
  return (job as Record<string, string>)[locale] ?? job.de;
}

export function isKnownJobSlug(slug: string): boolean {
  return JOB_CATEGORIES.some((j) => j.slug === slug);
}
