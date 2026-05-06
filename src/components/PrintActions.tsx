"use client";

export function PrintActions({ backHref }: { backHref: string }) {
  return (
    <div className="print-actions">
      <button
        onClick={() => window.print()}
        style={{
          background: "#6F9EAB",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: 999,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        🖨 Drucken / als PDF speichern
      </button>
      <a
        href={backHref}
        style={{
          border: "1px solid #6F9EAB",
          color: "#6F9EAB",
          padding: "10px 20px",
          borderRadius: 999,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ← zurück zum Profil
      </a>
    </div>
  );
}
