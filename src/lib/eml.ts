// Weg 1: fertige E-Mail als Datei (.eml, RFC 5322/MIME) zum Öffnen im eigenen Mailprogramm.
// „X-Unsent: 1“ lässt Outlook die Datei als Entwurf öffnen; Thunderbird und Apple Mail zeigen sie an,
// dort wird sie mit „Als neu bearbeiten“ bzw. „Erneut senden“ zum Entwurf.
// WoYou verschickt diese Mail nie selbst. Ohne Abhängigkeiten (auch in scripts/weg1-test.ts genutzt).

export type EmlAttachment = { filename: string; type: string; data: Uint8Array };
export type EmlInput = { from?: { name?: string; email: string } | null; to?: string | null; subject: string; body: string; attachments: EmlAttachment[]; date?: Date };

const CRLF = "\r\n";
const isAscii = (s: string) => /^[\x20-\x7E]*$/.test(s);
const b64 = (data: Uint8Array | string) => Buffer.from(data).toString("base64");
const wrap76 = (s: string) => s.replace(/.{1,76}/g, (m) => m + CRLF).replace(/\r\n$/, "");

/** Kopfzeile nach RFC 2047 (UTF-8, Base64), in Stücken, damit keine Zeile zu lang wird */
export function encodeWord(s: string): string {
  if (isAscii(s) && s.length < 900) return s;
  const parts: string[] = [];
  let cur = "";
  for (const ch of s) {
    if (Buffer.byteLength(cur + ch) > 45) { parts.push(cur); cur = ""; }
    cur += ch;
  }
  if (cur) parts.push(cur);
  return parts.map((p) => `=?UTF-8?B?${b64(p)}?=`).join(`${CRLF} `);
}

/** Dateiname nur mit sicheren Zeichen (Umlaute umschreiben), damit jedes Programm ihn richtig zeigt */
export function safeFilename(name: string): string {
  const n = name.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").replace(/_+(?=\.|$)/g, "").replace(/^_+/, "").slice(0, 120);
  return n || "Datei";
}

const cleanHeader = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
const EMAIL = /^[^@\s<>"(),;:]+@[^@\s<>"(),;:]+\.[^@\s<>"(),;:]+$/;

export function buildEml(m: EmlInput): string {
  const boundary = `----=_WoYou_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const date = (m.date ?? new Date()).toUTCString().replace("GMT", "+0000");
  const h: string[] = [];
  if (m.from && EMAIL.test(m.from.email)) {
    const name = cleanHeader(m.from.name ?? "").replace(/"/g, "");
    h.push(`From: ${name ? `${isAscii(name) ? `"${name}"` : encodeWord(name)} ` : ""}<${m.from.email}>`);
  }
  if (m.to && EMAIL.test(m.to.trim())) h.push(`To: ${m.to.trim()}`);
  h.push(`Subject: ${encodeWord(cleanHeader(m.subject))}`, `Date: ${date}`, "X-Unsent: 1", "MIME-Version: 1.0", `Content-Type: multipart/mixed; boundary="${boundary}"`);
  const body = m.body.replace(/\r?\n/g, CRLF);
  const out: string[] = [h.join(CRLF), "", "This is a multi-part message in MIME format.", `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrap76(b64(body))];
  for (const a of m.attachments) {
    const fn = safeFilename(a.filename);
    out.push(`--${boundary}`, `Content-Type: ${a.type}; name="${fn}"`, "Content-Transfer-Encoding: base64", `Content-Disposition: attachment; filename="${fn}"`, "", wrap76(b64(a.data)));
  }
  out.push(`--${boundary}--`, "");
  return out.join(CRLF);
}
