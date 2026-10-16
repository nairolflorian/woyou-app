import "server-only";

// Lebenslauf und Anschreiben als PDF – neutrales, ruhiges Layout (Helvetica, Grautöne, kein Farbschmuck).
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ProfileData, Station } from "@/lib/application";

const C = { ink: "#1f1f1f", soft: "#5c5c5c", line: "#cfcfcf" };
const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 48, paddingHorizontal: 56, fontFamily: "Helvetica", fontSize: 10, color: C.ink, lineHeight: 1.45 },
  head: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 0.3, lineHeight: 1.15 },
  role: { fontSize: 11, color: C.soft, marginTop: 6 },
  contact: { fontSize: 9, color: C.soft, marginTop: 8 },
  photo: { width: 92, height: 118, objectFit: "cover" },
  h2: { fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 16, paddingBottom: 3, borderBottomWidth: 0.6, borderBottomColor: C.line, marginBottom: 7 },
  row: { flexDirection: "row", marginBottom: 7 },
  date: { width: 92, color: C.soft, fontSize: 9, paddingTop: 1 },
  body: { flex: 1 },
  bold: { fontFamily: "Helvetica-Bold" },
  soft: { color: C.soft },
  bullet: { flexDirection: "row", marginTop: 1 },
  footer: { position: "absolute", bottom: 28, left: 56, right: 56, fontSize: 8, color: C.soft, textAlign: "right" },
  // Brief
  sender: { fontSize: 9, color: C.soft, textAlign: "right", marginBottom: 36 },
  recipient: { marginBottom: 30, minHeight: 60 },
  dateRight: { textAlign: "right", marginBottom: 18 },
  subject: { fontFamily: "Helvetica-Bold", marginBottom: 16 },
  para: { marginBottom: 9 },
});

export type DocLang = "de" | "en";
const L = {
  de: { summary: "Kurzprofil", experience: "Berufserfahrung", education: "Ausbildung", skills: "Kenntnisse", languages: "Sprachen", professional: "Fachlich", driving: "Führerschein", available: "Verfügbar", now: "sofort", from: "ab", birth: "Geburtsdatum", nationality: "Staatsangehörigkeit", cv: "Lebenslauf", page: "Seite", of: "von", enclosure: "Anlage: Lebenslauf", dateLocale: "de-DE" },
  en: { summary: "Profile", experience: "Work experience", education: "Education", skills: "Skills", languages: "Languages", professional: "Professional", driving: "Driving licence", available: "Available", now: "immediately", from: "from", birth: "Date of birth", nationality: "Nationality", cv: "CV", page: "Page", of: "of", enclosure: "Enclosure: CV", dateLocale: "en-GB" },
};

const lines = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);
const period = (x: Station) => [x.from, x.to].filter(Boolean).join(" – ");

function StationList({ items }: { items: Station[] }) {
  return (
    <>
      {items.filter((x) => x.title).map((x, i) => (
        <View key={i} style={s.row} wrap={false}>
          <Text style={s.date}>{period(x)}</Text>
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
  const l = L[lang];
  const name = `${d.firstName} ${d.lastName}`.trim();
  const contact = [[d.street, d.zipCity].filter(Boolean).join(", "), d.phone, d.email].filter(Boolean).join("   ·   ");
  const personal = [d.birthDate && `${l.birth}: ${d.birthDate}`, d.nationality && `${l.nationality}: ${d.nationality}`].filter(Boolean) as string[];
  const langs = d.languages.filter((l) => l.name);
  const skills = lines(d.skills);
  return (
    <Document title={`${l.cv} ${name}`} author={name}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={s.name}>{name}</Text>
            {d.targetJob && <Text style={s.role}>{d.targetJob}</Text>}
            <Text style={s.contact}>{contact}</Text>
            {personal.length > 0 && <Text style={s.contact}>{personal.join("   ·   ")}</Text>}
          </View>
          {photo && d.showPhoto && <Image src={photo} style={s.photo} />}
        </View>

        {d.summary && (<><Text style={s.h2}>{l.summary}</Text><Text>{d.summary}</Text></>)}
        {d.experience.some((x) => x.title) && (<><Text style={s.h2}>{l.experience}</Text><StationList items={d.experience} /></>)}
        {d.education.some((x) => x.title) && (<><Text style={s.h2}>{l.education}</Text><StationList items={d.education} /></>)}

        {(langs.length > 0 || skills.length > 0 || d.drivingLicense) && <Text style={s.h2}>{l.skills}</Text>}
        {langs.length > 0 && <View style={s.row}><Text style={s.date}>{l.languages}</Text><Text style={s.body}>{langs.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(", ")}</Text></View>}
        {skills.length > 0 && <View style={s.row}><Text style={s.date}>{l.professional}</Text><Text style={s.body}>{skills.join(", ")}</Text></View>}
        {d.drivingLicense && <View style={s.row}><Text style={s.date}>{l.driving}</Text><Text style={s.body}>{d.drivingLicense}</Text></View>}
        {d.availableFrom && <View style={s.row}><Text style={s.date}>{l.available}</Text><Text style={s.body}>{/sofort|immediately|now/i.test(d.availableFrom) ? l.now : `${l.from} ${d.availableFrom}`}</Text></View>}

        <Text style={s.footer} render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${name} · ${l.page} ${pageNumber} ${l.of} ${totalPages}` : "")} fixed />
      </Page>
    </Document>
  );
}

export function LetterDocument({ d, recipient, subject, text, date, lang = "de" }: { d: ProfileData; recipient: string[]; subject: string; text: string; date?: string; lang?: DocLang }) {
  const l = L[lang];
  const name = `${d.firstName} ${d.lastName}`.trim();
  const sender = [name, d.street, d.zipCity, d.phone, d.email].filter(Boolean).join("  ·  ");
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <Document title={subject} author={name}>
      <Page size="A4" style={s.page}>
        <Text style={s.sender}>{sender}</Text>
        <View style={s.recipient}>{recipient.filter(Boolean).map((r, i) => <Text key={i}>{r}</Text>)}</View>
        <Text style={s.dateRight}>{[d.zipCity.replace(/^\d+\s*/, ""), date || new Date().toLocaleDateString(l.dateLocale, lang === "en" ? { day: "numeric", month: "long", year: "numeric" } : undefined)].filter(Boolean).join(", ")}</Text>
        <Text style={s.subject}>{subject}</Text>
        {paras.map((p, i) => <Text key={i} style={s.para}>{p}</Text>)}
        <Text style={{ marginTop: 14, color: C.soft, fontSize: 9 }}>{l.enclosure}</Text>
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
