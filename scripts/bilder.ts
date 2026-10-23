/**
 * Erzeugt alle eigenen Bilder der Website in hoher Auflösung neu:
 *   - Muster-Lebenslauf und Muster-Anschreiben (PDF + Vorschau 1414x2000) aus der echten PDF-Vorlage
 *   - Design-Vorschauen der vier Lebenslauf-Designs (1272x1800)
 *   - Fotos der Startseite von Unsplash (public/bilder/*.jpg, Liste in src/lib/fotos.ts), selbst ausgeliefert
 *   - Social-Preview (src/app/opengraph-image.png, 1200x630)
 *   - Favicon/App-Icons (src/app/favicon.ico, icon.png, apple-icon.png) und public/Logo.png (Schema.org)
 *
 *   npx tsx scripts/bilder.ts            alles
 *   npx tsx scripts/bilder.ts muster     nur Muster + Designs
 *   npx tsx scripts/bilder.ts fotos      nur die Fotos (Netz nötig)
 *   npx tsx scripts/bilder.ts og icons   nur Social-Preview und Icons
 *
 * Werkzeuge: macOS Quick Look (qlmanage) rastert die PDFs, weil es Helvetica/Helvetica-Bold
 * wie Vorschau.app darstellt (pdftoppm ersetzt die nicht eingebetteten Fonts ohne Fettschnitt).
 * sharp kommt mit Next.js mit (Bildoptimierung), es ist keine eigene Abhängigkeit nötig.
 * Die Social-Preview nutzt das schon gespeicherte Foto public/bilder/handwerk.jpg.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { FOTOS, type Foto } from "../src/lib/fotos";

const ROOT = join(__dirname, "..");
const MUSTER = join(ROOT, "public/muster");
const APP = join(ROOT, "src/app");
const BILDER = join(ROOT, "public/bilder");
const what = process.argv.slice(2);
const want = (k: string) => what.length === 0 || what.includes(k);

const C = { brand: "#6F9EAB", deep: "#3e6f7e", ink: "#222222", soft: "#555555", ok: "#065f46", surface: "#f7f9fa" };
const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";
const kb = (b: Buffer) => `${Math.round(b.length / 1024)} KB`;

// PDF -> PNG über Quick Look (längste Seite = size), danach auf Weiß und als verlustfreies WebP
async function pdfToWebp(pdf: string, size: number, out: string) {
  const dir = mkdtempSync(join(tmpdir(), "woyou-ql-"));
  execFileSync("qlmanage", ["-t", "-s", String(size), "-o", dir, pdf], { stdio: "ignore" });
  const png = join(dir, readdirSync(dir).find((f) => f.endsWith(".png"))!);
  const buf = await sharp(png).flatten({ background: "#ffffff" }).webp({ lossless: true, effort: 6 }).toBuffer();
  writeFileSync(out, buf);
  rmSync(dir, { recursive: true, force: true });
  const m = await sharp(buf).metadata();
  console.log(`${out.replace(ROOT + "/", "")}  ${m.width}x${m.height}  ${kb(buf)}`);
}

async function muster() {
  const tmp = mkdtempSync(join(tmpdir(), "woyou-muster-"));
  execFileSync("npx", ["tsx", join(ROOT, "scripts/muster/render.tsx"), tmp, "designs"], { stdio: "inherit", cwd: ROOT });
  for (const n of ["muster-lebenslauf", "muster-anschreiben"]) {
    copyFileSync(join(tmp, `${n}.pdf`), join(MUSTER, `${n}.pdf`));
    await pdfToWebp(join(tmp, `${n}.pdf`), 2000, join(MUSTER, `${n}.webp`)); // A4: 1414x2000
  }
  for (const t of ["klassisch", "modern", "kompakt", "elegant"]) {
    await pdfToWebp(join(tmp, `design-${t}-lebenslauf.pdf`), 1800, join(MUSTER, `design-${t}.webp`)); // 1272x1800
  }
  rmSync(tmp, { recursive: true, force: true });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const check = (x: number, y: number) =>
  `<path d="M${x} ${y + 9} l6 6 l12 -13" fill="none" stroke="${C.ok}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;

// Unsplash-Ausschnitt in hoher Qualität laden und als progressives JPEG (mozjpeg, q85) speichern.
// next/image rechnet daraus die kleineren Größen (WebP) für srcset.
async function fotos() {
  mkdirSync(BILDER, { recursive: true });
  for (const f of Object.values(FOTOS) as Foto[]) {
    const url = `https://images.unsplash.com/${f.id}?w=${f.w}&h=${f.h}&fit=crop&crop=focalpoint&fp-x=${f.fx}&fp-y=${f.fy}&q=95&fm=jpg`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${f.id}: HTTP ${res.status}`);
    const buf = await sharp(Buffer.from(await res.arrayBuffer())).resize(f.w, f.h, { fit: "cover" })
      .jpeg({ quality: 85, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" }).toBuffer();
    writeFileSync(join(BILDER, `${f.datei}.jpg`), buf);
    console.log(`public/bilder/${f.datei}.jpg  ${f.w}x${f.h}  ${kb(buf)}  (${f.von})`);
  }
}

// Social-Preview 1200x630: Text links, Foto (Tischler, Unsplash-Lizenz) rechts
async function og() {
  const W = 1200, H = 630, PW = 430;
  const photo = await sharp(join(BILDER, `${FOTOS.handwerk.datei}.jpg`)).resize(PW, H, { fit: "cover", position: "attention" }).toBuffer();
  // Vertrauenszeile wie unter dem Knopf auf der Startseite, in zwei Reihen (passt sicher neben das Foto)
  const item = (x: number, y: number, t: string) =>
    `${check(x, y - 18)}<text x="${x + 28}" y="${y}" font-family="${FONT}" font-weight="700" font-size="23" fill="${C.ok}">${esc(t)}</text>`;
  const trustSvg = item(72, 524, "Keine Vermittlung") + item(330, 524, "Keine Garantie") + item(72, 566, "Du bewirbst dich selbst");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    <rect x="0" y="0" width="${W - PW}" height="8" fill="${C.deep}"/>
    <text x="72" y="104" font-family="${FONT}" font-weight="700" font-size="40" letter-spacing="-0.5"><tspan fill="${C.brand}">Wo</tspan><tspan fill="${C.ink}">You</tspan></text>
    <text font-family="${FONT}" font-weight="700" font-size="50" fill="${C.ink}" letter-spacing="-0.6">
      <tspan x="72" y="222">Deine Bewerbungs-</tspan>
      <tspan x="72" y="282">unterlagen nach</tspan>
      <tspan x="72" y="342">deutschem Standard.</tspan>
    </text>
    <text font-family="${FONT}" font-size="28" fill="${C.soft}">
      <tspan x="72" y="410">Und ein Werkzeug, mit dem du</tspan>
      <tspan x="72" y="448">dich selbst bewirbst.</tspan>
    </text>
    ${trustSvg}
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).composite([{ input: photo, left: W - PW, top: 0 }]).png({ palette: true, quality: 95, effort: 10, compressionLevel: 9 }).toBuffer();
  writeFileSync(join(APP, "opengraph-image.png"), buf);
  writeFileSync(join(APP, "opengraph-image.alt.txt"), "WoYou: Bewerbungsunterlagen nach deutschem Standard und ein Werkzeug, mit dem du dich selbst bewirbst");
  console.log(`src/app/opengraph-image.png  ${W}x${H}  ${kb(buf)}`);
}

// Icon: „W“ in Weiß auf Petrol, abgerundet
const iconSvg = (s: number, r = 0.22) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${100 * r}" fill="${C.deep}"/>
  <text x="50" y="71" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="62" fill="#ffffff">W</text>
</svg>`;

// ICO mit eingebetteten PNGs (von allen aktuellen Browsern unterstützt)
function ico(pngs: { size: number; data: Buffer }[]) {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let off = head.length;
  pngs.forEach((p, i) => {
    const o = 6 + 16 * i;
    head.writeUInt8(p.size >= 256 ? 0 : p.size, o); head.writeUInt8(p.size >= 256 ? 0 : p.size, o + 1);
    head.writeUInt8(0, o + 2); head.writeUInt8(0, o + 3);
    head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(p.data.length, o + 8); head.writeUInt32LE(off, o + 12);
    off += p.data.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.data)]);
}

async function icons() {
  const png = (s: number, r?: number) => sharp(Buffer.from(iconSvg(s, r))).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(join(APP, "icon.png"), await png(512));
  writeFileSync(join(APP, "apple-icon.png"), await sharp(Buffer.from(iconSvg(180, 0))).png({ compressionLevel: 9 }).toBuffer()); // iOS rundet selbst ab
  writeFileSync(join(APP, "favicon.ico"), ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })))));
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200">
    <rect width="600" height="200" fill="#ffffff"/>
    <text x="300" y="132" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="104" letter-spacing="-2"><tspan fill="${C.brand}">Wo</tspan><tspan fill="${C.ink}">You</tspan></text>
  </svg>`;
  writeFileSync(join(ROOT, "public/Logo.png"), await sharp(Buffer.from(logo)).png({ palette: true, compressionLevel: 9 }).toBuffer());
  console.log("src/app/icon.png 512, apple-icon.png 180, favicon.ico 16/32/48, public/Logo.png 600x200");
}

(async () => {
  if (want("muster")) await muster();
  if (want("fotos")) await fotos();
  if (want("og")) await og();
  if (want("icons")) await icons();
})().catch((e) => { console.error(e); process.exit(1); });
