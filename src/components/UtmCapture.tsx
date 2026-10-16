"use client";

import { useEffect } from "react";

// Merkt sich utm_source/utm_campaign aus Werbelinks für die Registrierung (sessionStorage, kein Cookie, kein Tracking)
export function UtmCapture() {
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const src = q.get("utm_source");
      if (src && !sessionStorage.getItem("woyou_src")) sessionStorage.setItem("woyou_src", [src, q.get("utm_campaign")].filter(Boolean).join("/").slice(0, 80));
    } catch { /* ohne sessionStorage einfach nichts merken */ }
  }, []);
  return null;
}
