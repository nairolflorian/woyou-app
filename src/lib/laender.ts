// Länderseiten (Pilot Westbalkan, Konzept v4): /rs, /ba, /me im Pilot, /xk, /al, /mk, /in vorbereitet.
// Reine Daten und Funktionen ohne Importe mit Nebenwirkungen, damit sie auch in der Middleware und im Browser laufen
// und in scripts/weg1-test.ts testbar sind.
//
// Jede Länderseite stellt die Sprache ein (Cookie woyou_locale, nur wenn noch keins gesetzt ist; wer selbst umstellt,
// behält seine Wahl) und merkt sich die Herkunft für die Auswertung (sessionStorage woyou_src, siehe UtmCapture).
import { BALKAN_GROUPS, WESTBALKAN, type BalkanGroup, type BalkanLand, type CheckLang } from "./selfcheck";
import type { Locale } from "./i18n-meta";

export type LandSlug = "rs" | "ba" | "me" | "xk" | "al" | "mk" | "in";
export type LandCode = BalkanLand | "IN";

export type Land = {
  slug: LandSlug;
  code: LandCode;
  /** Oberflächensprache beim ersten Besuch (Albanisch und Mazedonisch gibt es nicht: Englisch) */
  locale: Locale;
  /** im Pilot (in der Sitemap, von Suchmaschinen indexiert); sonst vorbereitet */
  pilot: boolean;
  westbalkan: boolean;
  /** Deutsche Botschaft im Land (offizielle Quelle) */
  botschaft: string;
  /** Ort der Botschaft in lateinischer Schrift */
  botschaftOrt: string;
  /** weitere Sprachen, die auf der Seite als Knöpfe angeboten werden */
  sprachen?: Locale[];
};

// Botschafts-Adressen am 26.10.2026 geprüft (HTTP 200)
export const LAENDER: Record<LandSlug, Land> = {
  rs: { slug: "rs", code: "RS", locale: "sr", pilot: true, westbalkan: true, botschaft: "https://belgrad.diplo.de", botschaftOrt: "Beograd" },
  ba: { slug: "ba", code: "BA", locale: "sr", pilot: true, westbalkan: true, botschaft: "https://sarajewo.diplo.de", botschaftOrt: "Sarajevo" },
  me: { slug: "me", code: "ME", locale: "sr", pilot: true, westbalkan: true, botschaft: "https://podgorica.diplo.de", botschaftOrt: "Podgorica" },
  xk: { slug: "xk", code: "XK", locale: "en", pilot: false, westbalkan: true, botschaft: "https://pristina.diplo.de", botschaftOrt: "Prishtina" },
  al: { slug: "al", code: "AL", locale: "en", pilot: false, westbalkan: true, botschaft: "https://tirana.diplo.de", botschaftOrt: "Tirana" },
  mk: { slug: "mk", code: "MK", locale: "en", pilot: false, westbalkan: true, botschaft: "https://skopje.diplo.de", botschaftOrt: "Skopje" },
  in: { slug: "in", code: "IN", locale: "en", pilot: false, westbalkan: false, botschaft: "https://india.diplo.de", botschaftOrt: "New Delhi", sprachen: ["en", "hi", "te"] },
};
export const LAND_SLUGS = Object.keys(LAENDER) as LandSlug[];

// Offizielle Quellen für die Kampagne (am 26.10.2026 geprüft, HTTP 200). Die alte BA-Adresse /vor-ort/zav/westbalkanregelung leitet hierher weiter.
export const QUELLE_BA = "https://www.arbeitsagentur.de/vor-ort/zav/amz/westbalkan-regelung";
export const BOTSCHAFT_STANDARD = LAENDER.rs;

/** Slug aus Pfad oder Parameter, nur bekannte Länder (Groß- und Kleinschreibung egal) */
export function landSlug(v: string | null | undefined): LandSlug | null {
  const s = (v ?? "").trim().toLowerCase();
  return (LAND_SLUGS as string[]).includes(s) ? (s as LandSlug) : null;
}

const LAND_PFAD = /^\/(rs|ba|me|xk|al|mk|in)\/?$/;
const KAMPAGNE_PFAD = /^\/(januar|spremi-se-za-januar)\/?$/;
/** Ländercode am Ende einer Quelle, z. B. fb_rs oder land_ba */
const QUELLE_LAND = /_(rs|ba|me|xk|al|mk|in)$/;

export const landAusPfad = (pathname: string): LandSlug | null => (LAND_PFAD.exec(pathname)?.[1] as LandSlug | undefined) ?? null;
export const istKampagnenPfad = (pathname: string) => KAMPAGNE_PFAD.test(pathname);

/** Land aus der Werbequelle („fb_rs/januar“ → rs) für die Auswertung; null, wenn keins erkennbar */
export function landAusQuelle(source: string | null | undefined): LandSlug | null {
  const src = (source ?? "").split("/")[0].trim().toLowerCase();
  return (QUELLE_LAND.exec(src)?.[1] as LandSlug | undefined) ?? null;
}
/** Kanal ohne Land („fb_rs“ → „fb“, „land_rs“ → „land“) */
export const kanalAusQuelle = (source: string | null | undefined): string => (source ?? "").split("/")[0].trim().toLowerCase().replace(QUELLE_LAND, "") || "direkt / unbekannt";

/**
 * Sprache, die die Middleware beim ersten Besuch setzt (nur ohne Cookie woyou_locale):
 * Länderseite → Sprache des Landes; Kampagnenseite → Sprache des Landes aus ?land= oder aus der Quelle (fb_rs), sonst nichts.
 */
export function startSprache(pathname: string, search: URLSearchParams): Locale | null {
  const land = landAusPfad(pathname);
  if (land) return LAENDER[land].locale;
  if (istKampagnenPfad(pathname)) {
    const l = landSlug(search.get("land")) ?? landAusQuelle(search.get("utm_source"));
    return l ? LAENDER[l].locale : null;
  }
  return null;
}

const KURZ = /^[a-z0-9][a-z0-9._-]{0,39}$/;
/**
 * Herkunft für woyou_src („quelle/kampagne“, höchstens 80 Zeichen) aus dem ersten Aufruf.
 * Mit Land (Länderseite oder ?land=): Quelle bekommt das Länderkürzel angehängt, falls es fehlt (facebook → facebook_rs);
 * ohne utm_source zählt der Besuch als land_rs. Ohne Werbelink und ohne Land: null (nichts merken).
 */
export function quelleAusLink(pathname: string, search: URLSearchParams): string | null {
  const land = landAusPfad(pathname) ?? landSlug(search.get("land"));
  let src = (search.get("utm_source") ?? "").trim();
  const campaign = (search.get("utm_campaign") ?? "").trim();
  if (land) {
    src = src.toLowerCase();
    if (!KURZ.test(src)) src = `land_${land}`;
    else if (landAusQuelle(src) !== land) src = `${src.replace(QUELLE_LAND, "")}_${land}`.slice(0, 40);
  }
  if (!src) return null;
  return [src, campaign].filter(Boolean).join("/").slice(0, 80);
}

// Ländernamen für den Selbstcheck: Westbalkan aus selfcheck.ts, Indien hier
const INDIEN: Record<CheckLang, string> = { de: "Indien", en: "India", fr: "Inde", ar: "الهند", hi: "भारत", sr: "Indija", te: "భారతదేశం" };
export function landName(code: LandCode, lang: CheckLang): string {
  if (code === "IN") return INDIEN[lang];
  return WESTBALKAN.find((c) => c.id === code)!.names[lang];
}

/** Vorbelegung des Selbstchecks aus ?land=RS&gruppe=ce (unbekannte Werte fallen weg) */
export function selbstcheckVorbelegung(p: { land?: string | null; gruppe?: string | null }, lang: CheckLang): { country: string; group: BalkanGroup | "" } {
  const slug = landSlug(p.land);
  const g = (p.gruppe ?? "").trim().toLowerCase();
  return {
    country: slug ? landName(LAENDER[slug].code, lang) : "",
    group: (BALKAN_GROUPS as string[]).includes(g) ? (g as BalkanGroup) : "",
  };
}

/** Link zum Selbstcheck mit vorbelegtem Land */
export const selbstcheckHref = (land?: LandSlug | null) => (land ? `/selbstcheck?land=${LAENDER[land].code}` : "/selbstcheck");
