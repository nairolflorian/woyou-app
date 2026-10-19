import "server-only";

// Lebenslauf und Anschreiben als PDF. Vier Designs zur Auswahl, alle ruhig und nach deutschem Standard:
//   klassisch (Standard): wie bisher, Helvetica, Linien unter den Überschriften
//   modern:   farbige Seitenleiste links mit Kontakt, Sprachen und Kenntnissen
//   kompakt:  Farbband oben mit Name und Kontakt, etwas enger gesetzt
//   elegant:  Serifenschrift (Times), Name zentriert, feine Linien
// Die Farbe (siehe DESIGN_COLORS) färbt Name, Überschriften bzw. Leiste und Band. Anschreiben passt sich an.
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ProfileData, Station } from "@/lib/application";
import { DESIGN_COLORS, type DesignTemplate } from "@/lib/design";

const INK = "#1f1f1f", SOFT = "#5c5c5c", LINE = "#cfcfcf";

type Theme = { template: DesignTemplate; accent: string; font: string; bold: string };

function themeOf(d: ProfileData): Theme {
  const template = (d.design?.template ?? "klassisch") as DesignTemplate;
  const accent = DESIGN_COLORS.find((c) => c.value === d.design?.color)?.value ?? DESIGN_COLORS[0].value;
  const serif = template === "elegant";
  return { template, accent, font: serif ? "Times-Roman" : "Helvetica", bold: serif ? "Times-Bold" : "Helvetica-Bold" };
}

function styles(t: Theme) {
  const compact = t.template === "kompakt";
  return StyleSheet.create({
    page: { paddingTop: compact ? 0 : 48, paddingBottom: 48, paddingLeft: t.template === "modern" ? 208 : 56, paddingRight: t.template === "modern" ? 40 : 56, fontFamily: t.font, fontSize: compact ? 9.5 : 10, color: INK, lineHeight: compact ? 1.38 : 1.45 },
    // Kopf
    head: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
    name: { fontSize: t.template === "elegant" ? 24 : 22, fontFamily: t.bold, letterSpacing: t.template === "elegant" ? 2 : 0.3, lineHeight: 1.15, color: t.template === "klassisch" ? t.accent : INK },
    role: { fontSize: 11, color: SOFT, marginTop: 6 },
    contact: { fontSize: 9, color: SOFT, marginTop: 8 },
    photo: { width: 92, height: 118, objectFit: "cover" },
    // Farbband (kompakt)
    band: { backgroundColor: t.accent, marginHorizontal: -56, paddingHorizontal: 56, paddingTop: 34, paddingBottom: 18, marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    bandName: { fontSize: 22, fontFamily: t.bold, color: "#ffffff", lineHeight: 1.15 },
    bandText: { fontSize: 9, color: "#ffffff", opacity: 0.92, marginTop: 5 },
    // Elegant: zentrierter Kopf
    centerHead: { alignItems: "center", marginBottom: 18, paddingBottom: 12, borderBottomWidth: 0.8, borderBottomColor: t.accent },
    // Überschriften
    h2: t.template === "elegant"
      ? { fontSize: 10.5, fontFamily: t.bold, textTransform: "uppercase", letterSpacing: 1.8, marginTop: 16, marginBottom: 7, color: t.accent }
      : { fontSize: 10, fontFamily: t.bold, textTransform: "uppercase", letterSpacing: 1.2, marginTop: compact ? 12 : 16, paddingBottom: 3, borderBottomWidth: 0.6, borderBottomColor: t.template === "klassisch" ? LINE : t.accent, marginBottom: 7, color: t.template === "klassisch" ? INK : t.accent },
    row: { flexDirection: "row", marginBottom: compact ? 5 : 7 },
    date: { width: t.template === "modern" ? 78 : 92, color: SOFT, fontSize: 9, paddingTop: 1 },
    body: { flex: 1 },
    bold: { fontFamily: t.bold },
    soft: { color: SOFT },
    bullet: { flexDirection: "row", marginTop: 1 },
    footer: { position: "absolute", bottom: 28, left: t.template === "modern" ? 208 : 56, right: 56, fontSize: 8, color: SOFT, textAlign: "right" },
    // Modern: Seitenleiste
    sideBg: { position: "absolute", left: 0, top: 0, bottom: 0, width: 180, backgroundColor: t.accent },
    side: { position: "absolute", left: 0, top: 0, width: 180, paddingTop: 48, paddingHorizontal: 20 },
    sideH: { fontSize: 9, fontFamily: t.bold, textTransform: "uppercase", letterSpacing: 1.2, color: "#ffffff", marginTop: 16, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 0.6, borderBottomColor: "#ffffff" },
    sideText: { fontSize: 9, color: "#ffffff", marginBottom: 4, lineHeight: 1.4 },
    sidePhoto: { width: 120, height: 152, objectFit: "cover", marginBottom: 6, alignSelf: "center" },
    // Brief
    sender: { fontSize: 9, color: SOFT, textAlign: "right", marginBottom: 36 },
    recipient: { marginBottom: 30, minHeight: 60 },
    dateRight: { textAlign: "right", marginBottom: 18 },
    subject: { fontFamily: t.bold, marginBottom: 16, color: t.template === "klassisch" ? INK : t.accent },
    para: { marginBottom: 9 },
    stripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 10, backgroundColor: t.accent },
  });
}

export type DocLang = "de" | "en";
const L = {
  de: { summary: "Kurzprofil", experience: "Berufserfahrung", education: "Ausbildung", skills: "Kenntnisse", languages: "Sprachen", professional: "Fachlich", driving: "Führerschein", available: "Verfügbar", now: "sofort", from: "ab", birth: "Geburtsdatum", nationality: "Staatsangehörigkeit", cv: "Lebenslauf", page: "Seite", of: "von", enclosure: "Anlage: Lebenslauf", dateLocale: "de-DE", contactH: "Kontakt", personalH: "Persönlich", to: " bis " },
  en: { summary: "Profile", experience: "Work experience", education: "Education", skills: "Skills", languages: "Languages", professional: "Professional", driving: "Driving licence", available: "Available", now: "immediately", from: "from", birth: "Date of birth", nationality: "Nationality", cv: "CV", page: "Page", of: "of", enclosure: "Enclosure: CV", dateLocale: "en-GB", contactH: "Contact", personalH: "Personal", to: " to " },
};

const lines = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);
const period = (x: Station, sep = " bis ") => [x.from, x.to].filter(Boolean).join(sep);
type S = ReturnType<typeof styles>;

function StationList({ items, sep, s }: { items: Station[]; sep?: string; s: S }) {
  return (
    <>
      {items.filter((x) => x.title).map((x, i) => (
        <View key={i} style={s.row} wrap={false}>
          <Text style={s.date}>{period(x, sep)}</Text>
          <View style={s.body}>
            <Text style={s.bold}>{x.title}</Text>
            {(x.place || x.city) && <Text style={s.soft}>{[x.place, x.city].filter(Boolean).join(", ")}</Text>}
            {lines(x.details).map((d, j) => (
              <View key={j} style={s.bullet}><Text style={{ width: 9 }}>·</Text><Text style={s.body}>{d}</Text></View>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

export function CvDocument({ d, photo, lang = "de" }: { d: ProfileData; photo?: Buffer | null; lang?: DocLang }) {
  const l = L[lang], t = themeOf(d), s = styles(t);
  const name = `${d.firstName} ${d.lastName}`.trim();
  const address = [d.street, d.zipCity].filter(Boolean).join(", ");
  const contact = [address, d.phone, d.email].filter(Boolean).join("   ·   ");
  const personal = [d.birthDate && `${l.birth}: ${d.birthDate}`, d.nationality && `${l.nationality}: ${d.nationality}`].filter(Boolean) as string[];
  const langs = d.languages.filter((x) => x.name);
  const langText = langs.map((x) => (x.level ? `${x.name} (${x.level})` : x.name));
  const skills = lines(d.skills);
  const available = d.availableFrom ? (/sofort|immediately|now/i.test(d.availableFrom) ? l.now : `${l.from} ${d.availableFrom}`) : "";
  const showPhoto = !!(photo && d.showPhoto);

  const Main = () => (
    <>
      {d.summary && (<><Text style={s.h2}>{l.summary}</Text><Text>{d.summary}</Text></>)}
      {d.experience.some((x) => x.title) && (<><Text style={s.h2}>{l.experience}</Text><StationList s={s} items={d.experience} sep={l.to} /></>)}
      {d.education.some((x) => x.title) && (<><Text style={s.h2}>{l.education}</Text><StationList s={s} items={d.education} sep={l.to} /></>)}
    </>
  );
  const Skills = () => (
    <>
      {(langs.length > 0 || skills.length > 0 || d.drivingLicense) && <Text style={s.h2}>{l.skills}</Text>}
      {langs.length > 0 && <View style={s.row}><Text style={s.date}>{l.languages}</Text><Text style={s.body}>{langText.join(", ")}</Text></View>}
      {skills.length > 0 && <View style={s.row}><Text style={s.date}>{l.professional}</Text><Text style={s.body}>{skills.join(", ")}</Text></View>}
      {d.drivingLicense && <View style={s.row}><Text style={s.date}>{l.driving}</Text><Text style={s.body}>{d.drivingLicense}</Text></View>}
      {available && <View style={s.row}><Text style={s.date}>{l.available}</Text><Text style={s.body}>{available}</Text></View>}
    </>
  );
  const footer = <Text style={s.footer} render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${name} · ${l.page} ${pageNumber} ${l.of} ${totalPages}` : "")} fixed />;

  if (t.template === "modern") {
    return (
      <Document title={`${l.cv} ${name}`} author={name}>
        <Page size="A4" style={s.page}>
          <View style={s.sideBg} fixed />
          <View style={s.side}>
              {showPhoto && <Image src={photo!} style={s.sidePhoto} />}
              <Text style={s.sideH}>{l.contactH}</Text>
              {[d.street, d.zipCity, d.phone, d.email].filter(Boolean).map((x) => <Text key={x} style={s.sideText}>{x}</Text>)}
              {personal.length > 0 && (<><Text style={s.sideH}>{l.personalH}</Text>{personal.map((x) => <Text key={x} style={s.sideText}>{x}</Text>)}</>)}
              {langs.length > 0 && (<><Text style={s.sideH}>{l.languages}</Text>{langText.map((x) => <Text key={x} style={s.sideText}>{x}</Text>)}</>)}
              {skills.length > 0 && (<><Text style={s.sideH}>{l.professional}</Text>{skills.map((x) => <Text key={x} style={s.sideText}>{x}</Text>)}</>)}
              {d.drivingLicense && (<><Text style={s.sideH}>{l.driving}</Text><Text style={s.sideText}>{d.drivingLicense}</Text></>)}
              {available && (<><Text style={s.sideH}>{l.available}</Text><Text style={s.sideText}>{available}</Text></>)}
          </View>
          <Text style={[s.name, { color: t.accent }]}>{name}</Text>
          {d.targetJob && <Text style={s.role}>{d.targetJob}</Text>}
          <Main />
          {footer}
        </Page>
      </Document>
    );
  }

  return (
    <Document title={`${l.cv} ${name}`} author={name}>
      <Page size="A4" style={s.page}>
        {t.template === "kompakt" ? (
          <View style={s.band}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={s.bandName}>{name}</Text>
              {d.targetJob && <Text style={[s.bandText, { fontSize: 11 }]}>{d.targetJob}</Text>}
              <Text style={s.bandText}>{contact}</Text>
              {personal.length > 0 && <Text style={s.bandText}>{personal.join("   ·   ")}</Text>}
            </View>
            {showPhoto && <Image src={photo!} style={{ width: 78, height: 100, objectFit: "cover" }} />}
          </View>
        ) : t.template === "elegant" ? (
          <View style={s.centerHead}>
            {showPhoto && <Image src={photo!} style={{ width: 84, height: 108, objectFit: "cover", marginBottom: 10 }} />}
            <Text style={[s.name, { textTransform: "uppercase", textAlign: "center" }]}>{name}</Text>
            {d.targetJob && <Text style={[s.role, { textAlign: "center" }]}>{d.targetJob}</Text>}
            <Text style={[s.contact, { textAlign: "center" }]}>{contact}</Text>
            {personal.length > 0 && <Text style={[s.contact, { textAlign: "center", marginTop: 3 }]}>{personal.join("   ·   ")}</Text>}
          </View>
        ) : (
          <View style={s.head}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={s.name}>{name}</Text>
              {d.targetJob && <Text style={s.role}>{d.targetJob}</Text>}
              <Text style={s.contact}>{contact}</Text>
              {personal.length > 0 && <Text style={s.contact}>{personal.join("   ·   ")}</Text>}
            </View>
            {showPhoto && <Image src={photo!} style={s.photo} />}
          </View>
        )}
        <Main />
        <Skills />
        {footer}
      </Page>
    </Document>
  );
}

export function LetterDocument({ d, recipient, subject, text, date, lang = "de" }: { d: ProfileData; recipient: string[]; subject: string; text: string; date?: string; lang?: DocLang }) {
  const l = L[lang], t = themeOf(d), s = styles(t);
  const name = `${d.firstName} ${d.lastName}`.trim();
  const sender = [name, d.street, d.zipCity, d.phone, d.email].filter(Boolean).join("  ·  ");
  const contact = [d.street, d.zipCity, d.phone, d.email].filter(Boolean).join("  ·  ");
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const dateLine = [d.zipCity.replace(/^\d+\s*/, ""), date || new Date().toLocaleDateString(l.dateLocale, lang === "en" ? { day: "numeric", month: "long", year: "numeric" } : undefined)].filter(Boolean).join(", ");
  const pageStyle = t.template === "modern" ? [s.page, { paddingLeft: 56, paddingRight: 56 }] : t.template === "kompakt" ? [s.page, { fontSize: 10, lineHeight: 1.45 }] : s.page;
  return (
    <Document title={subject} author={name}>
      <Page size="A4" style={pageStyle}>
        {t.template === "modern" && <View style={s.stripe} fixed />}
        {t.template === "kompakt" ? (
          <View style={[s.band, { paddingTop: 30, paddingBottom: 14, marginBottom: 30 }]}>
            <View><Text style={[s.bandName, { fontSize: 16 }]}>{name}</Text><Text style={s.bandText}>{contact}</Text></View>
          </View>
        ) : t.template === "elegant" ? (
          <View style={[s.centerHead, { marginBottom: 30 }]}>
            <Text style={[s.name, { fontSize: 18, textTransform: "uppercase", textAlign: "center" }]}>{name}</Text>
            <Text style={[s.contact, { textAlign: "center", marginTop: 5 }]}>{contact}</Text>
          </View>
        ) : t.template === "modern" ? (
          <View style={{ marginBottom: 30 }}>
            <Text style={[s.name, { fontSize: 18, color: t.accent }]}>{name}</Text>
            <Text style={[s.contact, { marginTop: 4 }]}>{contact}</Text>
          </View>
        ) : (
          <Text style={s.sender}>{sender}</Text>
        )}
        <View style={s.recipient}>{recipient.filter(Boolean).map((r, i) => <Text key={i}>{r}</Text>)}</View>
        <Text style={s.dateRight}>{dateLine}</Text>
        <Text style={s.subject}>{subject}</Text>
        {paras.map((p, i) => <Text key={i} style={s.para}>{p}</Text>)}
        <Text style={{ marginTop: 14, color: SOFT, fontSize: 9 }}>{l.enclosure}</Text>
      </Page>
    </Document>
  );
}

export async function cvPdf(d: ProfileData, photo?: Buffer | null, lang: DocLang = "de") {
  return renderToBuffer(<CvDocument d={d} photo={photo} lang={lang} />);
}
export async function letterPdf(d: ProfileData, recipient: string[], subject: string, text: string, lang: DocLang = "de") {
  return renderToBuffer(<LetterDocument d={d} recipient={recipient} subject={subject} text={text} lang={lang} />);
}
