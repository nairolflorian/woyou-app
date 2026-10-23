/**
 * Kleine Tests für die Kernlogik nach Weg 1 (ohne Datenbank, ohne Netz):
 * Preise und Laufzeiten, Deutsch-Hinweis, Filter, Sortierung, Dubletten, Suchvorschläge, Tracker-Stand,
 * E-Mail-Link und die Sperrliste der abgeschalteten Bereiche.
 *   npx tsx scripts/weg1-test.ts
 * Optional mit Live-Abfrage der Jobbörse (Netz nötig):
 *   npx tsx --conditions=react-server scripts/weg1-test.ts --live
 */
import assert from "node:assert/strict";
import { ANGEBOT, addMonths, extendUntil, toolState, formatPrice } from "../src/lib/angebot";
import {
  germanRequired, parseLevel, germanFit, matchesHours, matchesGerman, dedupe, rank, profileTerms, profileRegion,
  nextTrackerState, mailtoHref, mailtoLink, coverMail, isEmail, isHttpUrl, type Treffer,
} from "../src/lib/stellensuche-core";
import { buildEml, encodeWord, safeFilename } from "../src/lib/eml";
import { weg1Gesperrt, WEG1 } from "../src/lib/weg1";

let n = 0;
const test = (name: string, fn: () => void | Promise<void>) => Promise.resolve().then(fn).then(() => { n++; console.log(`ok  ${name}`); }, (e) => { console.error(`FEHLER  ${name}\n${e instanceof Error ? e.stack : e}`); process.exitCode = 1; });

async function main() {
  await test("Preise sind Platzhalter in Cent und plausibel", () => {
    assert.equal(ANGEBOT.startpaket.priceCents, 19900);
    assert.ok(ANGEBOT.startpaket.toolMonths >= 1);
    assert.ok(ANGEBOT.abo.priceCents > 0 && ANGEBOT.verlaengerung.priceCents > 0);
    assert.equal(formatPrice(19900, "de").replace(/\s/g, " "), "199 €");
    assert.equal(formatPrice(2950, "de").replace(/\s/g, " "), "29,50 €");
  });
  await test("Monate addieren kappt am Monatsende", () => {
    assert.equal(addMonths(new Date(2026, 0, 31), 1).getDate(), 28);
    assert.equal(addMonths(new Date(2028, 0, 31), 1).getDate(), 29);
    assert.equal(addMonths(new Date(2026, 9, 22), 3).getMonth(), 0);
  });
  await test("Verlängerung hängt an laufenden Zugang an, sonst ab heute", () => {
    const now = new Date(2026, 9, 22);
    assert.deepEqual(extendUntil(null, 3, now), new Date(2027, 0, 22));
    assert.deepEqual(extendUntil(new Date(2026, 11, 1), 1, now), new Date(2027, 0, 1));
    assert.deepEqual(extendUntil(new Date(2026, 5, 1), 1, now), new Date(2026, 10, 22)); // abgelaufen: ab heute
  });
  await test("Werkzeug-Stand", () => {
    const now = new Date(2026, 9, 22);
    assert.equal(toolState(null, now).active, false);
    assert.equal(toolState(new Date(2026, 9, 21), now).active, false);
    const s = toolState(new Date(2026, 9, 29), now);
    assert.equal(s.active, true); assert.equal(s.daysLeft, 7);
  });
  await test("Deutsch-Anforderung aus dem Anzeigentext", () => {
    assert.equal(germanRequired("Sie verfügen über Deutschkenntnisse auf dem Niveau B2."), "B2");
    assert.equal(germanRequired("Sprachniveau B1 Deutsch wird vorausgesetzt"), "B1");
    assert.equal(germanRequired("Sehr gute Deutschkenntnisse in Wort und Schrift"), "B2");
    assert.equal(germanRequired("Gute Deutschkenntnisse"), "B1");
    assert.equal(germanRequired("Grundkenntnisse in Deutsch reichen"), "A2");
    assert.equal(germanRequired("Führerschein Klasse B"), null);
    assert.equal(parseLevel("Muttersprache"), "C2");
    assert.equal(parseLevel("b1 (Zertifikat)"), "B1");
    assert.equal(parseLevel(""), null);
  });
  await test("Deutsch-Hinweis passt / knapp / zu hoch", () => {
    assert.equal(germanFit("B1", "B2"), "ok");
    assert.equal(germanFit("B2", "B1"), "close");
    assert.equal(germanFit("C1", "A2"), "high");
    assert.equal(germanFit("B2", null), "req");
    assert.equal(germanFit(null, "B1"), "none");
    assert.equal(matchesGerman({ fit: "high" }, true), false);
    assert.equal(matchesGerman({ fit: "close" }, true), true);
    assert.equal(matchesGerman({ fit: "high" }, false), true);
  });
  await test("Arbeitszeit-Filter lässt Stellen ohne Angabe drin", () => {
    assert.equal(matchesHours({ fulltime: true, parttime: false }, "teilzeit"), false);
    assert.equal(matchesHours({ fulltime: true, parttime: true }, "teilzeit"), true);
    assert.equal(matchesHours({ fulltime: false, parttime: false }, "vollzeit"), true);
    assert.equal(matchesHours({ fulltime: false, parttime: true }, "alle"), true);
  });
  const mk = (p: Partial<Treffer>): Treffer => ({ key: "BA:1", source: "BA", ref: "1", title: "Pflegefachkraft (m/w/d)", company: "A GmbH", city: "Köln", url: "https://x", applyUrl: null, email: null, fulltime: true, parttime: false, germanRequired: null, fit: "none", ...p });
  await test("Dubletten über Quellen hinweg", () => {
    const list = [mk({ key: "BA:1" }), mk({ key: "ARBEITNOW:x", source: "ARBEITNOW", title: "Pflegefachkraft (m/w/d)", company: "A GmbH" }), mk({ key: "BA:2", company: "B GmbH" }), mk({ key: "BA:2", company: "B GmbH" })];
    assert.deepEqual(dedupe(list).map((x) => x.key), ["BA:1", "BA:2"]);
  });
  await test("Sortierung: Beruf und Deutsch passen nach oben", () => {
    const now = Date.parse("2026-10-22");
    const list = [
      mk({ key: "a", title: "Lagerhelfer", fit: "ok" }),
      mk({ key: "b", title: "Pflegefachkraft Intensiv", fit: "high" }),
      mk({ key: "c", title: "Pflegefachkraft ambulant", fit: "ok", distanceKm: 5, publishedAt: "2026-10-20" }),
    ];
    assert.deepEqual(rank(list, "Pflegefachkraft", now).map((x) => x.key), ["c", "b", "a"]);
  });
  await test("Suchvorschläge aus dem Profil ohne Dubletten", () => {
    const t = profileTerms({ targetJob: "Pflegefachkraft", bookingJobs: "Pflegefachkraft, Altenpfleger/in; Pflegehelfer", desiredJob: "pflegefachkraft", experience: ["Krankenpfleger", "", null] });
    assert.deepEqual(t, ["Pflegefachkraft", "Altenpfleger/in", "Pflegehelfer", "Krankenpfleger"]);
    assert.equal(profileRegion("Deutschland, egal", "Köln, Bonn"), "Köln");
    assert.equal(profileRegion(null, "", "50667 Köln"), "50667 Köln");
  });
  await test("Tracker: Stand setzt Daten, ohne vorhandene zu überschreiben", () => {
    const now = new Date("2026-10-22T10:00:00Z"), earlier = new Date("2026-10-01T10:00:00Z");
    const empty = { appliedAt: null, repliedAt: null, interviewAt: null, closedAt: null };
    const a = nextTrackerState(empty, "APPLIED", now);
    assert.equal(a.status, "APPLIED"); assert.deepEqual(a.appliedAt, now); assert.equal(a.repliedAt, null);
    const i = nextTrackerState({ ...empty, appliedAt: earlier }, "INTERVIEW", now);
    assert.deepEqual(i.appliedAt, earlier); assert.deepEqual(i.interviewAt, now); assert.deepEqual(i.repliedAt, now); assert.equal(i.closedAt, null);
    const o = nextTrackerState(i, "OFFER", new Date("2026-11-01"));
    assert.ok(o.closedAt); assert.deepEqual(o.interviewAt, now);
    const back = nextTrackerState(o, "REPLY", now);
    assert.equal(back.closedAt, null);
    assert.deepEqual(nextTrackerState(o, "SAVED", now), { status: "SAVED", ...empty });
    // ganzer Datenbank-Eintrag als Eingabe: nur Stand und Daten kommen zurück, nichts anderes
    const row = { id: "x", status: "SAVED", notes: "n", ...empty };
    assert.deepEqual(Object.keys(nextTrackerState(row, "APPLIED", now)).sort(), ["appliedAt", "closedAt", "interviewAt", "repliedAt", "status"]);
    assert.equal(nextTrackerState(row, "APPLIED", now).status, "APPLIED");
    const r = nextTrackerState(empty, "REJECTED", now); // Absage ohne vorher „beworben“: Datum wird nachgetragen
    assert.deepEqual(r.appliedAt, now); assert.deepEqual(r.closedAt, now);
  });
  await test("E-Mail-Link: Empfänger, Betreff, Text, gekürzt, nur gültige Adressen", () => {
    const body = coverMail({ lang: "de", title: "Koch", salutation: "Sehr geehrte Damen und Herren,", name: "Fatima Benali", phone: "+212 600" });
    assert.match(body, /anbei sende ich Ihnen meine Bewerbung als Koch/);
    const h = mailtoHref("jobs@firma.de", "Bewerbung als Koch", body)!;
    assert.ok(h.startsWith("mailto:jobs@firma.de?subject=Bewerbung%20als%20Koch&body="));
    assert.ok(decodeURIComponent(h).includes("Mit freundlichen Grüßen"));
    assert.ok(h.includes("%0D%0A") && !/[^D]%0A/.test(h), "Zeilenumbrüche als CRLF");
    assert.ok(mailtoHref("a@b.de", "x", "y".repeat(5000))!.length <= 1800);
    const long = mailtoLink("a@b.de", "Betreff", "Wort ".repeat(800));
    assert.equal(long.truncated, true); assert.ok(long.href.length <= 1800);
    assert.equal(mailtoLink("a@b.de", "x", "kurz").truncated, false);
    assert.ok(mailtoLink("", "x", "y").href.startsWith("mailto:?subject=x"), "ohne Empfänger");
    assert.ok(!mailtoLink("a@b.de?cc=x", "s", "b").href.includes("?cc"), "kein zusätzlicher Empfänger über die Adresse");
    assert.match(coverMail({ lang: "de", title: "Koch", salutation: "Hallo,", name: "F B", email: "f@b.de" }), /F B\nf@b\.de$/);
    assert.equal(mailtoHref("keine-adresse", "x", "y"), null);
    assert.equal(mailtoHref("a@b.de?cc=evil@x.de", "x", "y"), null);
    assert.equal(isEmail("a@b.de"), true);
    assert.equal(isHttpUrl("javascript:alert(1)"), false);
    assert.equal(isHttpUrl("https://www.arbeitsagentur.de/jobsuche"), true);
    assert.match(coverMail({ lang: "en", title: "Cook", salutation: "Dear Sir or Madam,", name: "F" }), /Kind regards/);
  });
  await test(".eml: Entwurf mit X-Unsent, multipart/mixed, Anhänge, kodierter Betreff", () => {
    const pdf = new Uint8Array(Buffer.from("%PDF-1.4 Test äöü", "utf8"));
    const eml = buildEml({ from: { name: "Fatima Benali", email: "fatima@example.com" }, to: "jobs@firma.de", subject: "Bewerbung als Köchin, Referenznummer 10000-123", body: "Sehr geehrte Damen und Herren,\n\nanbei …\n\nMit freundlichen Grüßen", attachments: [{ filename: "Anschreiben_Fatima_Müller_GmbH.pdf", type: "application/pdf", data: pdf }, { filename: "Lebenslauf.pdf", type: "application/pdf", data: pdf }] });
    const [head] = eml.split("\r\n\r\n");
    assert.match(head, /^From: "Fatima Benali" <fatima@example\.com>$/m);
    assert.match(head, /^To: jobs@firma\.de$/m);
    assert.match(head, /^X-Unsent: 1$/m);
    assert.match(head, /^Subject: =\?UTF-8\?B\?/m);
    assert.match(head, /^Content-Type: multipart\/mixed; boundary="[^"]+"$/m);
    assert.equal((eml.match(/Content-Disposition: attachment/g) ?? []).length, 2);
    assert.ok(eml.includes('filename="Anschreiben_Fatima_Mueller_GmbH.pdf"'));
    assert.ok(eml.split("\r\n").every((l) => l.length <= 998), "Zeile zu lang");
    assert.ok(!/[^\r]\n/.test(eml), "nur CRLF");
    const b = buildEml({ from: null, to: "keine adresse", subject: "x\r\nBcc: evil@x.de", body: "y", attachments: [] });
    assert.ok(!/^From:/m.test(b) && !/^To:/m.test(b) && !/^Bcc:/m.test(b), "keine eingeschleusten Kopfzeilen");
    assert.equal(Buffer.from(encodeWord("Grüße").replace(/^=\?UTF-8\?B\?|\?=$/g, ""), "base64").toString(), "Grüße");
    assert.equal(safeFilename("Lebenslauf Jürgen Groß.pdf"), "Lebenslauf_Juergen_Gross.pdf");
  });
  await test("Weg 1: abgeschaltete Bereiche sind gesperrt, das Werkzeug nicht", () => {
    assert.equal(Object.values(WEG1).every((v) => v === false), true);
    for (const p of ["/api/admin/bookings/abc/apply", "/api/admin/bookings/abc/suggest", "/api/admin/bookings/abc/leads", "/api/admin/leads/x/send", "/api/mail/inbound", "/api/credits/purchase", "/api/company/register", "/api/admin/matches/propose", "/api/candidate/matches/1/consent", "/api/chat/1/messages", "/api/cron/re-match"])
      assert.ok(weg1Gesperrt(p), p);
    assert.equal(weg1Gesperrt("/admin/matching"), "admin");
    assert.equal(weg1Gesperrt("/arbeitgeber/registrierung"), "seite");
    assert.equal(weg1Gesperrt("/bewerber"), "seite");
    assert.equal(weg1Gesperrt("/admin/analytics"), "admin");
    assert.equal(weg1Gesperrt("/admin/firmen/x"), "admin");
    assert.equal(weg1Gesperrt("/bewerbungsmappe"), null);
    assert.equal(weg1Gesperrt("/api/stellen/1/eml"), null);
    assert.equal(weg1Gesperrt("/api/account/bewerbungsmail"), null);
    for (const p of ["/stellensuche", "/meine-bewerbungen", "/api/stellensuche", "/api/stellen/1", "/api/werkzeug/kaufen", "/api/admin/bookings", "/api/admin/bookings/export", "/admin/buchungen/abc", "/api/mappe/freigeben", "/api/webhooks/stripe", "/firmenlauf"])
      assert.equal(weg1Gesperrt(p), null, p);
  });
  await test("Texte: keine langen Gedankenstriche und keine alten Versprechen in den neuen Kundentexten", async () => {
    const fs = await import("node:fs");
    for (const f of ["src/lib/werkzeug-text.ts", "src/lib/account-text.ts", "src/lib/services.ts", "src/lib/landing-copy.ts", "src/lib/marketing.ts", "src/lib/mappe-i18n.ts", "src/lib/company.ts", "src/lib/selfcheck.ts", "src/components/SelfCheck.tsx", "src/components/MyDocuments.tsx", "src/lib/versand-text.ts", "src/components/VersandPanel.tsx", "src/components/VersandAdresse.tsx", "src/app/demo/page.tsx", "src/lib/auto-match.ts"]) {
      const s = fs.readFileSync(f, "utf8").split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
      assert.ok(!/[–—]/.test(s), `${f}: langer Gedankenstrich`);
      assert.ok(!/25 Bewerbungen|bewerben dich|in deinem Namen|in your name|en votre nom/i.test(s), `${f}: altes Versprechen`);
      assert.ok(!/25 طلب|باسمك|نيابة عنك|25 आवेदन|आपकी ओर से आवेदन/.test(s), `${f}: altes Versprechen (ar/hi)`);
    }
  });

  // ---------- Arabisch und Hindi für die neuen Texte ----------
  const AR = /[؀-ۿ]/, HI = /[ऀ-ॿ]/, LETTER = /[A-Za-zÀ-ÿ؀-ۿऀ-ॿ]/;
  // alle Texte eines Objekts einsammeln; Funktionen (Mail-Bausteine) mit Beispielwerten aufrufen
  const leaves = (x: unknown, path = ""): [string, string][] => {
    if (typeof x === "string") return [[path, x]];
    if (typeof x === "function") return leaves((x as (...a: unknown[]) => unknown)(...(x.length === 2 ? [3, "29 €"] : x.length === 1 ? ["Fatima"] : [])), `${path}()`);
    if (Array.isArray(x)) return x.flatMap((v, i) => leaves(v, `${path}[${i}]`));
    if (x && typeof x === "object") return Object.entries(x).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
    return [];
  };
  const shape = (x: unknown): unknown => (Array.isArray(x) ? x.map(shape) : x && typeof x === "object" ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, shape((x as Record<string, unknown>)[k])])) : typeof x);
  // gleiche Schlüssel wie Deutsch, jeder Text in der richtigen Schrift, keine langen Gedankenstriche
  const checkLang = (name: string, de: unknown, ar: unknown, hi: unknown, opts: { sameShape?: boolean } = {}) => {
    if (opts.sameShape !== false) {
      assert.deepEqual(shape(ar), shape(de), `${name}: ar hat andere Schlüssel als de`);
      assert.deepEqual(shape(hi), shape(de), `${name}: hi hat andere Schlüssel als de`);
    }
    for (const [lang, obj, script] of [["ar", ar, AR], ["hi", hi, HI]] as const) {
      const ls = leaves(obj);
      assert.ok(ls.length > 0, `${name}/${lang}: leer`);
      for (const [p, v] of ls) {
        assert.ok(!/[–—]/.test(v), `${name}/${lang} ${p}: langer Gedankenstrich`);
        if (LETTER.test(v.replace(/WoYou|Stripe|KarriereKind GmbH|PDF|Word|WhatsApp|HR|Pflegefachkraft|Bundesagentur für Arbeit|anerkennung-in-deutschland\.de|[A-C][12]|\{\w+\}/g, ""))) assert.ok(script.test(v), `${name}/${lang} ${p}: nicht übersetzt: ${v}`);
      }
    }
  };

  await test("Selbstversand-Texte: alle Sprachen vollständig, ohne lange Gedankenstriche und ohne Versand durch WoYou", async () => {
    const { VERSAND_TEXTS } = await import("../src/lib/versand-text");
    for (const l of ["en", "fr"] as const) assert.deepEqual(shape(VERSAND_TEXTS[l]), shape(VERSAND_TEXTS.de), `versandText ${l}`);
    checkLang("versandText", VERSAND_TEXTS.de, VERSAND_TEXTS.ar, VERSAND_TEXTS.hi);
    for (const [l, o] of Object.entries(VERSAND_TEXTS)) for (const [p, v] of leaves(o)) assert.ok(!/[–—]/.test(v), `${l} ${p}`);
    assert.match(VERSAND_TEXTS.de.sendLead, /eigenen Postfach/);
    assert.match(VERSAND_TEXTS.de.profileLead, /kein Passwort/);
  });
  await test("Arabisch und Hindi: Bewerbungswerkzeug (Oberfläche und Mails)", async () => {
    const w = await import("../src/lib/werkzeug-text");
    assert.equal(w.wLang("ar"), "ar"); assert.equal(w.wLang("hi"), "hi"); assert.equal(w.wLang("es"), "en"); assert.equal(w.wLang(null), "de");
    assert.equal(w.dirOf("ar"), "rtl"); assert.equal(w.dirOf("hi"), "ltr");
    checkLang("werkzeugText", w.werkzeugText("de"), w.werkzeugText("ar"), w.werkzeugText("hi"));
    const strip = <T extends { dir: string }>(o: T) => { const { dir, ...rest } = o; void dir; return rest; };
    const mailParts = (m: (l: string) => object, l: string) => { const o = m(l) as Record<string, unknown>; const { lang, dateLocale, ...rest } = o; void lang; void dateLocale; return strip(rest as { dir: string }); };
    for (const [n, f] of [["mappeMail", w.mappeMail], ["purchaseMail", w.purchaseMail], ["bookingMail", w.bookingMail]] as const)
      checkLang(n, mailParts(f, "de"), mailParts(f, "ar"), mailParts(f, "hi"));
    assert.equal(w.mappeMail("ar").dir, "rtl");
    assert.equal(w.mappeMail("ar").hello("Fatima"), "مرحبًا Fatima،");
    assert.equal(w.arMonths(3), "3 أشهر");
  });
  await test("Arabisch und Hindi: Startseite, Buchung, Kundenbereich, Mappe, Selbstcheck", async () => {
    const { landingCopy } = await import("../src/lib/landing-copy");
    checkLang("landingCopy", landingCopy("de"), landingCopy("ar"), landingCopy("hi"));
    const { serviceCopy } = await import("../src/lib/services");
    checkLang("serviceCopy", serviceCopy("de"), serviceCopy("ar"), serviceCopy("hi"));
    const { accountText } = await import("../src/lib/account-text");
    checkLang("accountText", accountText("de"), accountText("ar"), accountText("hi"));
    const { mappeText } = await import("../src/lib/mappe-i18n");
    const changed = (l: string) => { const m = mappeText(l); return { intro: m.intro, submittedMsg: m.submittedMsg, cvSaved: m.cvSaved, ownHint: m.ownHint }; };
    checkLang("mappeText (geänderte Schlüssel)", changed("de"), changed("ar"), changed("hi"));
    const { evaluate } = await import("../src/lib/selfcheck");
    const green = { job: "Koch", degree: "vocational", german: "B1", recognition: "unknown", country: "Marokko" } as const;
    const helper = { ...green, job: "Lagerhelfer", german: "A2" } as const;
    checkLang("Selbstcheck", [evaluate(green, "de").reasons, evaluate(helper, "de").reasons], [evaluate(green, "ar").reasons, evaluate(helper, "ar").reasons], [evaluate(green, "hi").reasons, evaluate(helper, "hi").reasons]);
  });
  await test("Arabisch und Hindi: Marketing-Mails für jeden Schritt (Quelltext)", async () => {
    const fs = await import("node:fs");
    const s = fs.readFileSync("src/lib/marketing.ts", "utf8");
    const count = (re: RegExp) => (s.match(re) ?? []).length;
    const de = count(/^ {6}de: \(v\) =>/gm);
    assert.ok(de >= 9, "Schritte nicht gefunden");
    assert.equal(count(/^ {6}ar: \(v\) =>/gm), de, "nicht jeder Schritt hat ar");
    assert.equal(count(/^ {6}hi: \(v\) =>/gm), de, "nicht jeder Schritt hat hi");
    for (const l of s.split("\n").filter((x) => /^ {6}ar: \(v\) =>/.test(x))) assert.ok(AR.test(l) && !/[–—]/.test(l), l.slice(0, 60));
    for (const l of s.split("\n").filter((x) => /^ {6}hi: \(v\) =>/.test(x))) assert.ok(HI.test(l) && !/[–—]/.test(l), l.slice(0, 60));
    assert.match(s, /^ {2}ar: "[^"]*[؀-ۿ]/m, "Abmeldetext ar fehlt");
    assert.match(s, /^ {2}hi: "[^"]*[ऀ-ॿ]/m, "Abmeldetext hi fehlt");
    assert.match(s, /layout\([^\n]*dirOf\(lang\)\)/, "Mail ohne Schreibrichtung");
  });
  await test("Arabisch und Hindi: Preise und Datum mit lesbaren Ziffern", async () => {
    const { dateLocaleOf } = await import("../src/lib/werkzeug-text");
    const ar = formatPrice(19900, "ar"), hi = formatPrice(2950, "hi");
    assert.ok(/199/.test(ar) && ar.includes("€"), ar);
    assert.ok(/29[.,]50/.test(hi) && hi.includes("€"), hi);
    assert.ok(/22.*10.*2026/.test(new Date(2026, 9, 22).toLocaleDateString(dateLocaleOf("ar"))));
    assert.ok(/22.*10.*2026/.test(new Date(2026, 9, 22).toLocaleDateString(dateLocaleOf("hi"))));
  });

  if (process.argv.includes("--live")) {
    await test("Live: Jobbörse liefert Treffer mit Arbeitszeit-Filter", async () => {
      const { searchJobs, jobDetails } = await import("../src/lib/jobs-ba");
      const r = await searchJobs({ was: "Pflegefachkraft", wo: "Köln", umkreis: 25, size: 5, arbeitszeit: "tz" });
      assert.ok(r.total > 0 && r.jobs.length > 0);
      assert.ok(r.jobs.every((j) => j.parttime || !j.fulltime));
      const d = await jobDetails(r.jobs[0].ref);
      assert.ok(d && d.description.length > 50);
      console.log(`    ${r.total} Treffer, erstes Deutsch-Niveau: ${germanRequired(d!.description) ?? "keine Angabe"}`);
    });
    await test("Live: Stellensuche über alle Quellen mit Filtern und Deutsch-Hinweis", async () => {
      const { sucheStellen, rememberedTreffer } = await import("../src/lib/stellensuche");
      const r = await sucheStellen({ was: "Koch", wo: "Berlin", umkreis: 25, arbeitszeit: "vollzeit", deutsch: "A2", nurPassend: true, seite: 1 });
      assert.ok(r.treffer.length > 0, "keine Treffer");
      assert.ok(r.treffer.every((t) => t.fit !== "high"), "zu hohe Deutsch-Anforderung trotz Filter");
      assert.ok(r.treffer.every((t) => t.fulltime || !t.parttime), "Teilzeit trotz Vollzeit-Filter");
      assert.ok(rememberedTreffer(r.treffer[0].key), "Treffer nicht zum Merken gespeichert");
      const fits = r.treffer.reduce<Record<string, number>>((a, t) => ({ ...a, [t.fit]: (a[t.fit] ?? 0) + 1 }), {});
      console.log(`    ${r.total} Treffer gesamt, ${r.treffer.length} auf Seite 1, Quellen ${r.quellen.map((q) => `${q.name}:${q.ok ? "ok" : "fehlt"}`).join(" ")}, Deutsch ${JSON.stringify(fits)}`);
    });
  }
  console.log(process.exitCode ? "\nEs gibt Fehler." : `\nAlle ${n} Tests bestanden.`);
}
void main();
