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
  nextTrackerState, mailtoHref, coverMail, isEmail, isHttpUrl, type Treffer,
} from "../src/lib/stellensuche-core";
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
    const r = nextTrackerState(empty, "REJECTED", now); // Absage ohne vorher „beworben“: Datum wird nachgetragen
    assert.deepEqual(r.appliedAt, now); assert.deepEqual(r.closedAt, now);
  });
  await test("E-Mail-Link: Empfänger, Betreff, Text, gekürzt, nur gültige Adressen", () => {
    const body = coverMail({ lang: "de", title: "Koch", salutation: "Sehr geehrte Damen und Herren,", name: "Fatima Benali", phone: "+212 600" });
    assert.match(body, /anbei sende ich Ihnen meine Bewerbung als Koch/);
    const h = mailtoHref("jobs@firma.de", "Bewerbung als Koch", body)!;
    assert.ok(h.startsWith("mailto:jobs%40firma.de?subject=Bewerbung%20als%20Koch&body="));
    assert.ok(decodeURIComponent(h).includes("Mit freundlichen Grüßen"));
    assert.ok(mailtoHref("a@b.de", "x", "y".repeat(5000))!.length <= 1800);
    assert.equal(mailtoHref("keine-adresse", "x", "y"), null);
    assert.equal(mailtoHref("a@b.de?cc=evil@x.de", "x", "y"), null);
    assert.equal(isEmail("a@b.de"), true);
    assert.equal(isHttpUrl("javascript:alert(1)"), false);
    assert.equal(isHttpUrl("https://www.arbeitsagentur.de/jobsuche"), true);
    assert.match(coverMail({ lang: "en", title: "Cook", salutation: "Dear Sir or Madam,", name: "F" }), /Kind regards/);
  });
  await test("Weg 1: abgeschaltete Bereiche sind gesperrt, das Werkzeug nicht", () => {
    assert.equal(Object.values(WEG1).every((v) => v === false), true);
    for (const p of ["/api/admin/bookings/abc/apply", "/api/admin/bookings/abc/suggest", "/api/admin/bookings/abc/leads", "/api/admin/leads/x/send", "/api/mail/inbound", "/api/credits/purchase", "/api/company/register", "/api/admin/matches/propose", "/api/candidate/matches/1/consent", "/api/chat/1/messages", "/api/cron/re-match"])
      assert.ok(weg1Gesperrt(p), p);
    assert.equal(weg1Gesperrt("/admin/matching"), "admin");
    assert.equal(weg1Gesperrt("/arbeitgeber/registrierung"), "seite");
    for (const p of ["/stellensuche", "/meine-bewerbungen", "/api/stellensuche", "/api/stellen/1", "/api/werkzeug/kaufen", "/api/admin/bookings", "/api/admin/bookings/export", "/admin/buchungen/abc", "/api/mappe/freigeben", "/api/webhooks/stripe", "/firmenlauf"])
      assert.equal(weg1Gesperrt(p), null, p);
  });
  await test("Texte: keine langen Gedankenstriche und keine alten Versprechen in den neuen Kundentexten", async () => {
    const fs = await import("node:fs");
    for (const f of ["src/lib/werkzeug-text.ts", "src/lib/account-text.ts", "src/lib/services.ts", "src/lib/landing-copy.ts", "src/lib/marketing.ts", "src/lib/mappe-i18n.ts", "src/lib/company.ts"]) {
      const s = fs.readFileSync(f, "utf8").split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
      assert.ok(!/[–—]/.test(s), `${f}: langer Gedankenstrich`);
      assert.ok(!/25 Bewerbungen|bewerben dich|in deinem Namen|in your name|en votre nom/i.test(s), `${f}: altes Versprechen`);
    }
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
