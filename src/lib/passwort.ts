// Mindestlängen für Passwörter (serverseitig geprüft). Team, Admin und Super-Admin haben Zugriff auf
// Kundendaten und brauchen daher längere Passwörter als Kund:innen.
import { ROLE } from "@/lib/enums";

export const PW_MIN_KUNDE = 8;
export const PW_MIN_TEAM = 12;

const TEAM_ROLLEN: string[] = [ROLE.TEAM, ROLE.ADMIN, ROLE.SUPER_ADMIN];
export const pwMin = (role?: string | null) => (role && TEAM_ROLLEN.includes(role) ? PW_MIN_TEAM : PW_MIN_KUNDE);
export const pwOk = (password: string, role?: string | null) => password.length >= pwMin(role);
