export type JobCategory = {
  slug: string;
  group: string;
  de: string;
  en: string;
  fr: string;
  ar: string;
};

export const JOB_CATEGORIES: JobCategory[] = [
  // Pflege & Gesundheit
  { slug: "pflegekraft", group: "care", de: "Pflegekraft", en: "Nurse", fr: "Infirmier·ère", ar: "ممرض" },
  { slug: "altenpflege", group: "care", de: "Altenpflege", en: "Elderly care", fr: "Soins aux personnes âgées", ar: "رعاية المسنين" },
  { slug: "arzt", group: "care", de: "Ärztin / Arzt", en: "Doctor", fr: "Médecin", ar: "طبيب" },
  { slug: "physiotherapie", group: "care", de: "Physiotherapie", en: "Physiotherapy", fr: "Kinésithérapie", ar: "علاج طبيعي" },

  // Gastronomie & Hotellerie
  { slug: "koch", group: "hospitality", de: "Koch / Köchin", en: "Chef / Cook", fr: "Cuisinier·ère", ar: "طاهٍ" },
  { slug: "kellner", group: "hospitality", de: "Kellner:in / Service", en: "Waiter / Service", fr: "Serveur·euse", ar: "نادل" },
  { slug: "hotelfach", group: "hospitality", de: "Hotelfachkraft", en: "Hotel professional", fr: "Personnel hôtelier", ar: "موظف فندق" },

  // Bau & Handwerk
  { slug: "elektriker", group: "construction", de: "Elektriker:in", en: "Electrician", fr: "Électricien·ne", ar: "كهربائي" },
  { slug: "klempner", group: "construction", de: "Klempner:in / SHK", en: "Plumber", fr: "Plombier·ère", ar: "سباك" },
  { slug: "maurer", group: "construction", de: "Maurer:in", en: "Bricklayer", fr: "Maçon·ne", ar: "بنّاء" },
  { slug: "schweisser", group: "construction", de: "Schweißer:in", en: "Welder", fr: "Soudeur·euse", ar: "لحّام" },
  { slug: "schreiner", group: "construction", de: "Schreiner:in / Tischler:in", en: "Carpenter", fr: "Menuisier·ère", ar: "نجار" },
  { slug: "kfz", group: "construction", de: "KFZ-Mechatroniker:in", en: "Auto mechatronics", fr: "Mécatronicien·ne auto", ar: "ميكانيكي سيارات" },

  // Logistik & Verkehr
  { slug: "lkw-fahrer", group: "logistics", de: "LKW-Fahrer:in", en: "Truck driver", fr: "Chauffeur·euse routier", ar: "سائق شاحنة" },
  { slug: "lager", group: "logistics", de: "Lagerlogistik", en: "Warehouse logistics", fr: "Logistique d'entrepôt", ar: "لوجستيات المستودعات" },

  // IT
  { slug: "softwareentwickler", group: "it", de: "Softwareentwickler:in", en: "Software developer", fr: "Développeur·euse", ar: "مطور برامج" },
  { slug: "it-support", group: "it", de: "IT-Support", en: "IT support", fr: "Support informatique", ar: "دعم تقني" },

  // Andere
  { slug: "verkauf", group: "other", de: "Verkauf / Einzelhandel", en: "Retail / Sales", fr: "Vente / Commerce", ar: "البيع بالتجزئة" },
  { slug: "reinigung", group: "other", de: "Reinigung", en: "Cleaning", fr: "Nettoyage", ar: "نظافة" },
  { slug: "kinderbetreuung", group: "other", de: "Kinderbetreuung", en: "Childcare", fr: "Garde d'enfants", ar: "رعاية أطفال" },
  { slug: "landwirtschaft", group: "other", de: "Landwirtschaft", en: "Agriculture", fr: "Agriculture", ar: "زراعة" },
  { slug: "sonderwunsch", group: "other", de: "Sonderwunsch / anderer Beruf", en: "Custom request / other", fr: "Demande spéciale / autre", ar: "طلب خاص / آخر" },
];

export const JOB_GROUPS: Record<
  string,
  { de: string; en: string; fr: string; ar: string; icon: string }
> = {
  care: { de: "Pflege & Gesundheit", en: "Care & health", fr: "Santé & soins", ar: "الرعاية والصحة", icon: "🩺" },
  hospitality: { de: "Gastronomie & Hotel", en: "Hospitality", fr: "Hôtellerie-restauration", ar: "الضيافة", icon: "🍽️" },
  construction: { de: "Bau & Handwerk", en: "Construction & trades", fr: "BTP & artisanat", ar: "البناء والحرف", icon: "🔨" },
  logistics: { de: "Logistik & Verkehr", en: "Logistics & transport", fr: "Logistique & transport", ar: "اللوجستيات", icon: "🚚" },
  it: { de: "IT & Tech", en: "IT & tech", fr: "Informatique", ar: "تكنولوجيا المعلومات", icon: "💻" },
  other: { de: "Weitere Berufe", en: "Other professions", fr: "Autres métiers", ar: "مهن أخرى", icon: "✨" },
};

export function jobLabel(slug: string, locale: string = "de"): string {
  const job = JOB_CATEGORIES.find((j) => j.slug === slug);
  if (!job) return slug;
  return (job as Record<string, string>)[locale] ?? job.de;
}
