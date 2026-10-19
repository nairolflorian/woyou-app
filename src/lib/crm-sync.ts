import "server-only";

// Anbindung an das EuBiA-CRM: WoYou meldet Kundenereignisse (registriert, gebucht, bezahlt, Mappe eingereicht,
// Bewerbungen laufen, Nachkauf, storniert), damit jede WoYou-Kund:in dort mit eigener Pipeline erscheint.
//   POST {EUBIA_CRM_URL}/hook/woyou?t={EUBIA_CRM_TOKEN}   (JSON, Antwort 200/201 = ok)
//
// DATENSCHUTZ: Gesendet wird nur, wenn zusätzlich EUBIA_CRM_SYNC=on gesetzt ist (Standard: aus).
// Vorher muss die Datenschutzerklärung von WoYou die Weitergabe der Kundendaten an EuBiA abdecken
// (Empfänger, Zweck, Rechtsgrundlage) und ein AV-Vertrag bzw. eine Vereinbarung mit EuBiA vorliegen.
// Demo- und Testkonten werden nie übertragen. Im Log stehen nur Ereignisname und Status, keine Personendaten.
//
// Der Aufruf blockiert den Hauptablauf nie: crmMelden() plant den Versand mit after() (läuft nach der Antwort)
// und fällt außerhalb einer Anfrage (z. B. Skripte) auf ein nicht abgewartetes Promise zurück. Fehler werden nur geloggt.
// Einrichtung auf dem Server: bash deploy/crm-einrichten.sh
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { crmConfig, sendCrmEvent, candidatePayload, isDemoEmail, type CrmEventName, type CrmPayload } from "@/lib/crm-core";

export type { CrmEventName, CrmPayload };

// Ein fertiges Ereignis senden (still, wenn nicht eingerichtet oder nicht freigegeben)
export async function crmEvent(event: CrmEventName, data: CrmPayload): Promise<void> {
  if (!crmConfig() || isDemoEmail(data.email)) return;
  await sendCrmEvent(event, data);
}

// Ereignis für eine Kund:in im Hintergrund melden: Stammdaten werden erst nach der Antwort geladen
export function crmMelden(event: CrmEventName, candidateId: string, extra: Partial<CrmPayload> = {}): void {
  if (!crmConfig()) return;
  const job = async () => {
    try {
      const data = await candidatePayload(prisma, candidateId, extra);
      if (data) await crmEvent(event, data);
    } catch {
      console.error(`[crm] ${event}: Daten nicht lesbar`);
    }
  };
  try {
    after(job);
  } catch {
    void job();
  }
}
