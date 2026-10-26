"use client";

import { useEffect } from "react";
import { quelleAusLink } from "@/lib/laender";

// Merkt sich utm_source/utm_campaign aus Werbelinks für die Registrierung (sessionStorage, kein Cookie, kein Tracking).
// Länderseiten (/rs, /ba, ...) und ?land= hängen das Länderkürzel an die Quelle (fb_rs), ohne Werbelink zählt land_rs.
export function UtmCapture() {
  useEffect(() => {
    try {
      const src = quelleAusLink(window.location.pathname, new URLSearchParams(window.location.search));
      if (src && !sessionStorage.getItem("woyou_src")) sessionStorage.setItem("woyou_src", src);
    } catch { /* ohne sessionStorage einfach nichts merken */ }
  }, []);
  return null;
}
