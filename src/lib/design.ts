// Designs und Farben für Lebenslauf und Anschreiben. Wird vom Editor (Client) und von pdf.tsx (Server) genutzt.
export const DESIGN_TEMPLATES = ["klassisch", "modern", "kompakt", "elegant"] as const;
export type DesignTemplate = (typeof DESIGN_TEMPLATES)[number];

// Gedeckte Farben, die auf Papier und in Graustufen gut lesbar bleiben. Die erste ist Standard.
export const DESIGN_COLORS = [
  { value: "#1f1f1f", name: { de: "Anthrazit", en: "Charcoal" } },
  { value: "#1f3a5f", name: { de: "Marine", en: "Navy" } },
  { value: "#2f5d50", name: { de: "Tannengrün", en: "Forest" } },
  { value: "#7a2e2a", name: { de: "Bordeaux", en: "Burgundy" } },
  { value: "#4b3f72", name: { de: "Aubergine", en: "Plum" } },
  { value: "#8a5a1f", name: { de: "Bernstein", en: "Amber" } },
] as const;

export const DEFAULT_DESIGN = { template: "klassisch" as DesignTemplate, color: DESIGN_COLORS[0].value as string };
