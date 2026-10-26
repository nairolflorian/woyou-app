"use client";

// Eingangsbestätigung nach Widerruf oder Kündigung: gleicher Text wie in der E-Mail, zum Speichern (.txt) und Drucken.
export function RechtBestaetigung({ betreff, zeilen, datei }: { betreff: string; zeilen: string[]; datei: string }) {
  function herunterladen() {
    const blob = new Blob([[betreff, "", ...zeilen].join("\r\n\r\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = datei;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="card mt-6 space-y-3" role="status">
      <h2 className="text-xl font-bold">{betreff}</h2>
      {zeilen.map((z, i) => <p key={i} className="text-sm leading-relaxed">{z}</p>)}
      <p className="text-sm text-[color:var(--color-ink-soft)]">Diese Bestätigung haben wir dir auch per E-Mail geschickt. Bitte speichere sie zusätzlich hier.</p>
      <div className="flex flex-wrap gap-3 print:hidden">
        <button type="button" className="btn-primary" onClick={herunterladen}>Bestätigung herunterladen</button>
        <button type="button" className="btn-outline" onClick={() => window.print()}>Drucken oder als PDF speichern</button>
      </div>
    </div>
  );
}
