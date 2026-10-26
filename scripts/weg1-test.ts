/**
 * Kleine Tests für die Kernlogik nach Weg 1 (ohne Datenbank, ohne Netz):
 * Angebot (nur Startpaket), Stripe je Umgebung (Staging nur Test, Produktion nur Live), CRM nur in Produktion, CRM bei Kontolöschung, Produktion ohne /demo,
 * Staging-Leiste, getrenntes Prod-Compose, Rechtstexte ohne Platzhalter, Demo-Beispielstellen, Deutsch-Hinweis, Filter, Sortierung, Dubletten, Suchvorschläge, Tracker-Stand,
 * E-Mail-Link und die Sperrliste der abgeschalteten Bereiche.
 *   npx tsx scripts/weg1-test.ts
 * Optional mit Live-Abfrage der Jobbörse (Netz nötig):
 *   npx tsx --conditions=react-server scripts/weg1-test.ts --live
 */
import assert from "node:assert/strict";
import { ANGEBOT, addMonths, extendUntil, toolState, formatPrice, isLegacyToolKind } from "../src/lib/angebot";
import { stripeKeyMode, stripeKeyAllowed, appEnv, allowedKeyMode } from "../src/lib/stripe-mode";
import { crmConfig, crmKontoGeloescht, kontoGeloeschtPayload } from "../src/lib/crm-core";
import { readFileSync } from "node:fs";
import { DEMO_JOBS, DEMO_TOOL_EMAILS, demoJobRow } from "../src/lib/demo-jobs";
import {
  germanRequired, parseLevel, germanFit, matchesHours, matchesGerman, dedupe, rank, profileTerms, profileRegion,
  nextTrackerState, mailtoHref, mailtoLink, coverMail, isEmail, isHttpUrl, type Treffer,
} from "../src/lib/stellensuche-core";
import { buildEml, encodeWord, safeFilename } from "../src/lib/eml";
import { weg1Gesperrt, WEG1 } from "../src/lib/weg1";

let n = 0;
const test = (name: string, fn: () => void | Promise<void>) => Promise.resolve().then(fn).then(() => { n++; console.log(`ok  ${name}`); }, (e) => { console.error(`FEHLER  ${name}\n${e instanceof Error ? e.stack : e}`); process.exitCode = 1; });

async function main() {
  await test("Angebot: nur das Startpaket für 199 € mit 3 Monaten Werkzeug, keine Verlängerung, kein Abo", () => {
    assert.deepEqual(Object.keys(ANGEBOT), ["startpaket"]);
    assert.equal(ANGEBOT.startpaket.priceCents, 19900);
    assert.equal(ANGEBOT.startpaket.toolMonths, 3);
    assert.ok(isLegacyToolKind("TOOL_MONTH") && isLegacyToolKind("TOOL_SUBSCRIPTION") && !isLegacyToolKind("PACK_25"));
    assert.equal(formatPrice(19900, "de").replace(/\s/g, " "), "199 €");
    assert.equal(formatPrice(2950, "de").replace(/\s/g, " "), "29,50 €");
  });
  await test("Monate addieren kappt am Monatsende", () => {
    assert.equal(addMonths(new Date(2026, 0, 31), 1).getDate(), 28);
    assert.equal(addMonths(new Date(2028, 0, 31), 1).getDate(), 29);
    assert.equal(addMonths(new Date(2026, 9, 22), 3).getMonth(), 0);
  });
  await test("Freischaltung hängt an laufenden Zugang an, sonst ab heute", () => {
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
  await test("Stripe: im DEMO_MODE nie ein Live-Schlüssel, nur Test-Schlüssel", () => {
    assert.equal(stripeKeyMode(""), "none"); assert.equal(stripeKeyMode(undefined), "none");
    assert.equal(stripeKeyMode("sk_test_abc"), "test"); assert.equal(stripeKeyMode("rk_test_abc"), "test");
    assert.equal(stripeKeyMode("sk_live_abc"), "live"); assert.equal(stripeKeyMode("rk_live_abc"), "live");
    assert.equal(stripeKeyMode("pk_live_abc"), "unknown");
    for (const demo of [undefined, "", "true", "1"]) {
      assert.equal(stripeKeyAllowed("sk_live_abc", demo), false, `Live im Demo (${demo})`);
      assert.equal(stripeKeyAllowed("rk_live_abc", demo), false);
      assert.equal(stripeKeyAllowed("irgendwas", demo), false);
      assert.equal(stripeKeyAllowed("sk_test_abc", demo), true);
    }
    assert.equal(stripeKeyAllowed("sk_live_abc", "false"), true);
    assert.equal(stripeKeyAllowed("", "false"), false);
  });
  await test("Stripe: Produktion (DEMO_MODE=false) nur Live-Schlüssel, nie Test oder Unbekanntes", () => {
    assert.equal(appEnv("false"), "prod"); assert.equal(appEnv(undefined), "staging"); assert.equal(appEnv("true"), "staging");
    assert.equal(allowedKeyMode("false"), "live"); assert.equal(allowedKeyMode("true"), "test");
    assert.equal(stripeKeyAllowed("sk_live_abc", "false"), true);
    assert.equal(stripeKeyAllowed("rk_live_abc", "false"), true);
    assert.equal(stripeKeyAllowed("sk_test_abc", "false"), false, "Test-Schlüssel in Produktion");
    assert.equal(stripeKeyAllowed("rk_test_abc", "false"), false);
    assert.equal(stripeKeyAllowed("irgendwas", "false"), false);
    assert.equal(stripeKeyAllowed(undefined, "false"), false);
  });
  await test("CRM: Staging meldet nie an das echte CRM, Produktion nur mit Freigabe", () => {
    const keep = { ...process.env };
    try {
      Object.assign(process.env, { EUBIA_CRM_URL: "https://crm.example.com/", EUBIA_CRM_TOKEN: "t", EUBIA_CRM_SYNC: "on" });
      for (const d of [undefined, "true", ""]) {
        if (d === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = d;
        assert.equal(crmConfig(), null, `Staging (${d})`);
      }
      process.env.DEMO_MODE = "false";
      assert.deepEqual(crmConfig(), { url: "https://crm.example.com", token: "t" });
      process.env.EUBIA_CRM_SYNC = "off";
      assert.equal(crmConfig(), null, "ohne Freigabe");
    } finally {
      for (const k of ["EUBIA_CRM_URL", "EUBIA_CRM_TOKEN", "EUBIA_CRM_SYNC", "DEMO_MODE"]) { if (k in keep) process.env[k] = keep[k]; else delete process.env[k]; }
    }
  });
  await test("CRM: konto_geloescht sendet genau woyouId, email, datum (+event), nur in Produktion, nie Demo, Fehler ohne Personendaten", async () => {
    const keep = { ...process.env };
    const realFetch = globalThis.fetch;
    const realError = console.error;
    const bodies: Record<string, unknown>[] = [];
    const logs: string[] = [];
    let status = 200;
    globalThis.fetch = (async (_u: unknown, init?: { body?: string }) => { bodies.push(JSON.parse(init!.body!)); return new Response("{}", { status }); }) as typeof fetch;
    console.error = (...a: unknown[]) => { logs.push(a.join(" ")); };
    try {
      assert.deepEqual(Object.keys(kontoGeloeschtPayload("c1", "a@b.de")).sort(), ["datum", "email", "woyouId"]);
      Object.assign(process.env, { EUBIA_CRM_URL: "https://crm.example.com", EUBIA_CRM_TOKEN: "t", EUBIA_CRM_SYNC: "on", DEMO_MODE: "true" });
      assert.equal(await crmKontoGeloescht("c1", "kunde@web.de"), false, "Staging");
      process.env.DEMO_MODE = "false";
      assert.equal(await crmKontoGeloescht("c1", "demo@woyou.test"), false, "Demo-Adresse");
      assert.equal(bodies.length, 0);
      assert.equal(await crmKontoGeloescht("c1", "kunde@web.de"), true);
      assert.deepEqual(Object.keys(bodies[0]).sort(), ["datum", "email", "event", "woyouId"]);
      assert.equal(bodies[0].event, "konto_geloescht"); assert.equal(bodies[0].woyouId, "c1"); assert.equal(bodies[0].email, "kunde@web.de");
      assert.ok(!Number.isNaN(Date.parse(String(bodies[0].datum))));
      status = 500;
      assert.equal(await crmKontoGeloescht("c2", "kunde@web.de"), false, "Fehler wirft nicht");
      globalThis.fetch = (async () => { throw new Error("weg"); }) as typeof fetch;
      assert.equal(await crmKontoGeloescht("c3", "kunde@web.de"), false, "Netzfehler wirft nicht");
      assert.ok(logs.some((l) => l.includes("c2")) && logs.some((l) => l.includes("c3")), "woyouId im Log");
      assert.ok(logs.every((l) => !l.includes("kunde@web.de")), "keine E-Mail im Log");
      // Die Löschung meldet VOR dem Verfremden der E-Mail
      const route = readFileSync(new URL("../src/app/api/account/delete/route.ts", import.meta.url), "utf8");
      assert.ok(route.indexOf("crmKontoGeloescht(") > 0 && route.indexOf("crmKontoGeloescht(") < route.indexOf("prisma.user.update("), "CRM-Meldung vor dem Löschen");
    } finally {
      globalThis.fetch = realFetch; console.error = realError;
      for (const k of ["EUBIA_CRM_URL", "EUBIA_CRM_TOKEN", "EUBIA_CRM_SYNC", "DEMO_MODE"]) { if (k in keep) process.env[k] = keep[k]; else delete process.env[k]; }
    }
  });
  await test("Produktion: keine /demo-Seite, kein Demo-Login, Staging-Leiste und -Abzeichen nur mit DEMO_MODE", () => {
    const src = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
    assert.match(src("src/app/demo/page.tsx"), /if \(!DEMO_MODE_ENABLED\) notFound\(\);/);
    assert.match(src("src/app/api/auth/demo-login/route.ts"), /if \(!DEMO_MODE_ENABLED\) \{\s*return NextResponse\.json\(\{ error: "NOT_FOUND" \}, \{ status: 404 \}\)/);
    const banner = src("src/components/StagingBanner.tsx");
    assert.match(banner, /if \(!DEMO_MODE_ENABLED\) return null;/); assert.match(banner, /STAGING/); assert.match(banner, /data-umgebung="staging"/);
    assert.match(src("src/app/layout.tsx"), /<StagingBanner \/>/);
    assert.match(src("src/components/SiteHeader.tsx"), /\{DEMO_MODE_ENABLED && \(/);
    assert.ok(!/>\s*DEMO\s*</.test(src("src/components/SiteHeader.tsx") + src("src/components/DemoModeBarClient.tsx")), "altes DEMO-Abzeichen");
    assert.equal(process.env.DEMO_MODE === "false" ? "prod" : "staging", appEnv(process.env.DEMO_MODE));
    assert.match(src("scripts/seed.ts"), /if \(process\.env\.DEMO_MODE === "false"\) \{[^}]*process\.exit\(1\)/, "Seed muss in Produktion abbrechen");
    for (const f of ["src/app/robots.ts", "src/app/sitemap.ts"]) assert.match(src(f), /export const dynamic = "force-dynamic"/, f);
  });
  await test("Produktion: Compose getrennt (eigenes Projekt, keine ${...}-Werte aus Staging, migrate ohne Seed)", () => {
    const y = readFileSync(new URL("../docker-compose.prod.yml", import.meta.url), "utf8");
    const code = y.split("\n").filter((l) => !l.trim().startsWith("#")).join("\n");
    assert.match(code, /^name: woyou-prod$/m);
    assert.ok(!/\$\{/.test(code), "keine Interpolation aus .env");
    assert.match(code, /container_name: woyou_app_prod/); assert.match(code, /container_name: woyou_postgres_prod/);
    assert.match(code, /"127\.0\.0\.1:3051:3000"/);
    assert.ok(!/seed/i.test(code), "kein Seed in Produktion");
    assert.match(code, /command: \["npx", "prisma", "migrate", "deploy"\]/);
    assert.match(code, /name: woyou_prod_pg/); assert.match(code, /name: woyou_prod_uploads/);
    assert.match(readFileSync(new URL("../.gitignore", import.meta.url), "utf8"), /^\.env\.prod$/m);
  });
  await test("Rechtstexte: keine Platzhalter, kein sichtbares „Entwurf“, ANWALT PRÜFEN nur als Kommentar, Angaben wie KarriereKind", async () => {
    const { COMPANY } = await import("../src/lib/company");
    assert.equal(COMPANY.name, "KarriereKind GmbH"); assert.equal(COMPANY.zipCity, "40212 Düsseldorf");
    assert.equal(COMPANY.register, "HRB 99139"); assert.equal(COMPANY.court, "Amtsgericht Düsseldorf"); assert.equal(COMPANY.ceo, "Rachid Debdoubi");
    for (const f of ["src/app/impressum/page.tsx", "src/app/datenschutz/page.tsx", "src/app/agb/page.tsx"]) {
      const t = readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
      assert.ok(!/Platzhalter|Entwurf|lorem|TODO|XXX|\[[^\]]*eintragen/i.test(t.replace(/\{\/\*[\s\S]*?\*\/\}|\/\/.*$/gm, "")), `Platzhalter in ${f}`);
      for (const line of t.split("\n")) if (/ANWALT PRÜFEN/.test(line)) assert.match(line, /^\s*(\/\/|\{\/\*)/, `sichtbarer ANWALT-Hinweis in ${f}: ${line.trim()}`);
      assert.ok(!/[–—]/.test(t.replace(/\{\/\*[\s\S]*?\*\/\}|\/\/.*$/gm, "")), `langer Gedankenstrich in ${f}`);
    }
  });
  await test("Kontakt wie KarriereKind: gelesene Postfächer, keine info@woyou.de mehr, keine USt-ID", async () => {
    const fs = await import("node:fs");
    const { COMPANY } = await import("../src/lib/company");
    assert.equal(COMPANY.email, "service@karrierekind.de");
    assert.equal(COMPANY.legalEmail, "info@karrierekind.de");
    assert.equal(COMPANY.phone, "+49 211 913 829 10", "Telefon: Zentrale der EuBiA wie auf www.eubia.de");
    assert.equal(COMPANY.phoneTel, "+4921191382910");
    assert.ok(!("vatId" in COMPANY) && !("ustId" in COMPANY), "USt-ID gibt es bei KarriereKind nicht");
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : /\.(tsx?|json)$/.test(e.name) ? [`${d}/${e.name}`] : []));
    const treffer = [...walk("src"), ...(fs.existsSync("messages") ? walk("messages") : [])].filter((f) => /info@woyou\.de|160 ?626 ?6208|1511 ?2213968|15112213968/.test(fs.readFileSync(f, "utf8")));
    assert.deepEqual(treffer, [], `alte Kontaktangaben in ${treffer.join(", ")}`);
    assert.match(fs.readFileSync("src/app/impressum/page.tsx", "utf8"), /COMPANY\.legalEmail/);
    for (const f of ["src/components/LoginForm.tsx", "src/components/SiteFooter.tsx", "src/components/SelfCheck.tsx", "src/app/abmelden/page.tsx", "src/app/datenschutz/page.tsx", "src/app/agb/page.tsx"])
      assert.match(fs.readFileSync(f, "utf8"), /COMPANY\.email/, f);
    assert.match(fs.readFileSync("src/lib/mail.ts", "utf8"), /replyTo: opts\.replyTo \|\| COMPANY\.email/, "Mails ohne Antwortadresse");
  });
  await test("Datenschutz: Abschnitt zur Weitergabe an das CRM der EuBiA-Gruppe passt zu den gesendeten Feldern", async () => {
    const fs = await import("node:fs");
    const t = fs.readFileSync("src/app/datenschutz/page.tsx", "utf8");
    const sichtbar = t.replace(/\{\/\*[\s\S]*?\*\/\}|\/\/.*$/gm, "");
    assert.match(sichtbar, /Weitergabe an das CRM der EuBiA-Gruppe/);
    for (const w of ["Hetzner Online GmbH", "Vereinbarung zur Auftragsverarbeitung", "Art. 6 Abs. 1 lit. b DSGVO", "Art. 6 Abs. 1 lit. f DSGVO", "Speicherdauer", "Getrennt von anderen Bereichen", "keinen Lebenslauf", "Staatsangehörigkeit", "Zielberuf", "Telefonnummer", "Betrag"])
      assert.ok(sichtbar.includes(w), `fehlt im CRM-Abschnitt: ${w}`);
    assert.match(t, /\{\/\* ANWALT PRÜFEN[^\n]*CRM/);
    // Felder, die das CRM bekommt, müssen genau die beschriebenen sein
    const core = fs.readFileSync("src/lib/crm-core.ts", "utf8");
    const felder = core.match(/export type CrmPayload = \{([\s\S]*?)\};/)![1].match(/^\s*(\w+)\??:/gm)!.map((x) => x.replace(/[\s?:]/g, ""));
    assert.deepEqual(felder, ["woyouId", "email", "vorname", "nachname", "telefon", "land", "zielberuf", "paket", "betrag", "datum"], "CRM-Felder geändert: Datenschutzerklärung anpassen");
    assert.match(fs.readFileSync("src/app/agb/page.tsx", "utf8"), /CRM der EuBiA-Gruppe/);
  });
  await test("Demo: Beispielstellen klar erfunden (Beispiel-Firmen, nur example.com), mit/ohne Mail, eine beworben", () => {
    assert.deepEqual([...DEMO_TOOL_EMAILS], ["fatima@example.com", "youssef@example.com"]);
    assert.ok(DEMO_JOBS.length >= 2 && DEMO_JOBS.length <= 3);
    for (const j of DEMO_JOBS) {
      assert.match(j.company, /Beispiel/, j.company);
      if (j.email) assert.match(j.email, /@example\.com$/, j.email);
      for (const u of [j.url, j.applyUrl]) if (u) assert.match(u, /^https:\/\/example\.com\//, u);
      assert.ok(!/[–—]/.test(j.title + j.description));
    }
    assert.ok(DEMO_JOBS.some((j) => j.email && j.status === "SAVED"), "Stelle mit E-Mail");
    assert.ok(DEMO_JOBS.some((j) => !j.email), "Stelle ohne E-Mail");
    assert.ok(DEMO_JOBS.some((j) => j.status === "APPLIED"), "Stelle schon beworben");
    assert.equal(new Set(DEMO_JOBS.map((j) => j.sourceRef)).size, DEMO_JOBS.length, "sourceRef eindeutig (idempotent)");
    const now = Date.UTC(2026, 9, 26), r = demoJobRow(DEMO_JOBS.find((j) => j.status === "APPLIED")!, now);
    assert.equal(r.source, "MANUAL"); assert.ok(r.appliedAt && r.appliedAt.getTime() < now && r.followUpAt && r.followUpAt.getTime() > now);
  });
  await test("Nur Startpaket: keine Verlängerung, kein Abo, keine Monatspreise in Kundentexten und Kaufwegen", async () => {
    const fs = await import("node:fs");
    const code = (f: string) => fs.readFileSync(f, "utf8").split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l) && !/\{\/\*/.test(l)).join("\n");
    for (const f of ["src/lib/landing-copy.ts", "src/lib/services.ts", "src/lib/account-text.ts", "src/lib/werkzeug-text.ts", "src/lib/marketing.ts", "src/app/agb/page.tsx", "src/app/profil/page.tsx", "src/components/ToolGate.tsx"]) {
      const s = code(f);
      assert.ok(!/verlaengerung|ANGEBOT\.abo|#verlaengern|\/api\/werkzeug\/kaufen/.test(s), `${f}: Verweis auf Verlängerung/Abo`);
      assert.ok(!/je Monat|im Monat|per month|a month|par mois|شهريًا|لكل شهر|प्रति माह/.test(s), `${f}: Monatspreis`);
      assert.ok(!/verlängern|verlängerst|Werkzeug verlängern|extend the tool|prolonger l'outil|تمديد الأداة|मدّد|अवधि बढ़ाएँ/i.test(s), `${f}: Verlängern-Aufforderung`);
      assert.ok(!/Monatsabo|monthly subscription|abonnement mensuel|اشتراك شهري|मासिक सदस्यता/i.test(s), `${f}: Abo-Angebot`);
    }
    assert.equal(fs.existsSync("src/components/ToolShop.tsx"), false, "Verlängern-Knöpfe entfernt");
    const { landingCopy } = await import("../src/lib/landing-copy");
    const de = landingCopy("de");
    assert.match(de.priceNote, /inklusive 3 Monate Zugang zum Bewerbungswerkzeug/);
    assert.match(de.priceNote, /deine Unterlagen behältst du/);
    assert.ok(de.faq.some((x) => /keine Verlängerung und kein Abo/.test(x.a)), "FAQ zu Kosten");
    assert.ok(de.faq.some((x) => /Was passiert nach 3 Monaten/.test(x.q)), "FAQ nach Ablauf");
    for (const l of ["en", "fr", "ar", "hi"] as const) assert.equal(landingCopy(l).faq.length, de.faq.length, `FAQ ${l}`);
    const { accountText } = await import("../src/lib/account-text");
    assert.match(accountText("de").toolIncluded, /keine Verlängerung und kein Abo/);
    assert.match(accountText("de").toolExpiredLead, /weiter herunterladen/);
    const w = await import("../src/lib/werkzeug-text");
    assert.match(w.werkzeugText("de").expiredLead, /gesperrt/);
    assert.match(w.werkzeugText("de").expiredLead, /herunterladen/);
  });
  await test("Kaufwege für Verlängerung und Abo antworten mit 410", async () => {
    const kaufen = await import("../src/app/api/werkzeug/kaufen/route");
    const kuendigen = await import("../src/app/api/werkzeug/kuendigen/route");
    assert.equal(kaufen.POST().status, 410);
    assert.equal(kaufen.GET().status, 410);
    assert.equal(kuendigen.POST().status, 410);
  });
  await test("Texte: keine langen Gedankenstriche und keine alten Versprechen in den neuen Kundentexten", async () => {
    const fs = await import("node:fs");
    for (const f of ["src/lib/werkzeug-text.ts", "src/lib/account-text.ts", "src/lib/services.ts", "src/lib/landing-copy.ts", "src/lib/marketing.ts", "src/lib/mappe-i18n.ts", "src/lib/company.ts", "src/lib/selfcheck.ts", "src/components/SelfCheck.tsx", "src/components/MyDocuments.tsx", "src/lib/versand-text.ts", "src/components/VersandPanel.tsx", "src/components/VersandAdresse.tsx", "src/app/demo/page.tsx", "src/lib/auto-match.ts", "src/lib/demo-jobs.ts", "src/components/MeineAnschreiben.tsx", "src/components/ToolGate.tsx", "src/app/agb/page.tsx", "src/app/datenschutz/page.tsx"]) {
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
    assert.equal("purchaseMail" in w, false, "Mails zu Verlängerung/Abo gibt es nicht mehr");
    for (const [n, f] of [["mappeMail", w.mappeMail], ["bookingMail", w.bookingMail]] as const)
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

  await test("Bilder: Fotos lokal und groß genug, nichts von Unsplash im Browser, Muster in hoher Auflösung", async () => {
    const fs = await import("node:fs");
    const { FOTOS, fotoSrc } = await import("../src/lib/fotos");
    for (const f of Object.values(FOTOS)) {
      const b = fs.readFileSync(`public${fotoSrc(f)}`);
      assert.ok(b.length < 400 * 1024, `${f.datei}.jpg zu groß`);
      const sof = b.findIndex((x, i) => x === 0xff && (b[i + 1] === 0xc0 || b[i + 1] === 0xc2)); // JPEG-Maße aus dem SOF-Block
      assert.deepEqual([b.readUInt16BE(sof + 7), b.readUInt16BE(sof + 5)], [f.w, f.h], `${f.datei}.jpg Maße`);
      assert.ok(f.w >= 1000 && f.von && f.seite.startsWith("https://unsplash.com/"), f.datei);
    }
    assert.ok(!/unsplash/i.test(fs.readFileSync("src/middleware.ts", "utf8")), "CSP erlaubt noch Unsplash");
    assert.ok(!/images\.unsplash\.com/.test(fs.readFileSync("next.config.ts", "utf8") + fs.readFileSync("src/lib/landing-copy.ts", "utf8")), "Bilder noch extern");
    assert.match(fs.readFileSync("src/app/impressum/page.tsx", "utf8"), /Bildnachweis/);
    for (const n of ["muster-lebenslauf", "muster-anschreiben", "design-klassisch", "design-modern", "design-kompakt", "design-elegant"]) {
      const b = fs.readFileSync(`public/muster/${n}.webp`);
      assert.equal(b.toString("ascii", 8, 12), "WEBP", n);
      assert.ok(b.length < 400 * 1024, n);
    }
    for (const f of ["src/app/opengraph-image.png", "src/app/icon.png", "src/app/apple-icon.png", "src/app/favicon.ico", "public/Logo.png"]) assert.ok(fs.existsSync(f), f);
    const og = fs.readFileSync("src/app/opengraph-image.png");
    assert.deepEqual([og.readUInt32BE(16), og.readUInt32BE(20)], [1200, 630], "Social-Preview 1200x630");
  });

  await test("Passwörter: Team/Admin/Super-Admin mindestens 12 Zeichen, Kund:innen mindestens 8", async () => {
    const fs = await import("node:fs");
    const { pwMin, pwOk, PW_MIN_KUNDE, PW_MIN_TEAM } = await import("../src/lib/passwort");
    assert.equal(PW_MIN_KUNDE, 8); assert.equal(PW_MIN_TEAM, 12);
    for (const r of ["TEAM", "ADMIN", "SUPER_ADMIN"]) { assert.equal(pwMin(r), 12, r); assert.ok(!pwOk("elf-zeichen", r)); assert.ok(pwOk("zwoelf-zeich", r)); }
    assert.equal(pwMin("CANDIDATE"), 8); assert.ok(!pwOk("sieben7", "CANDIDATE")); assert.ok(pwOk("achtacht", "CANDIDATE"));
    assert.match(fs.readFileSync("src/app/api/admin/team/route.ts", "utf8"), /min\(PW_MIN_TEAM\)/);
    assert.match(fs.readFileSync("src/app/api/account/route.ts", "utf8"), /pwOk\(parsed\.data\.newPassword, me\.role\)/);
    assert.match(fs.readFileSync("src/app/api/auth/register/route.ts", "utf8"), /min\(PW_MIN_KUNDE\)/);
    assert.ok(!/\b6 (Zeichen|characters|caractères)/.test(fs.readFileSync("src/lib/form-text.ts", "utf8")), "Formulartexte nennen noch 6 Zeichen");
  });

  await test("Datenschutz: CRM in Finnland (EU), App-Server nur „in der EU“, KI-Textdienst nicht im Einsatz", async () => {
    const fs = await import("node:fs");
    const t = fs.readFileSync("src/app/datenschutz/page.tsx", "utf8").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
    assert.match(t, /Helsinki, Finnland/);
    assert.ok(!/Server in Deutschland|Servern der Hetzner\s+Online GmbH in Deutschland/.test(t));
    assert.ok(!/Mistral/.test(t) && /Derzeit nicht im Einsatz/.test(t), "KI-Absatz");
    assert.ok(!/Server in Deutschland|Servers in Germany/.test(fs.readFileSync("src/lib/landing-copy.ts", "utf8")));
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
