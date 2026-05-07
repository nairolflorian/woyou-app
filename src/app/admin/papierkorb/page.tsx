import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { RestoreButton } from "@/components/RestoreButton";

export default async function PapierkorbPage() {
  const session = await getSession();
  if (session.role !== ROLE.SUPER_ADMIN) redirect("/admin");

  const users = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    include: { candidate: true, company: true },
    orderBy: { deletedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Papierkorb</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        Soft-gelöschte User. Werden 30 Tage nach Löschung permanent entfernt
        (Cron <code>woyou-purge</code>). Super-Admins können bis dahin
        wiederherstellen.
      </p>

      <div className="mt-6 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-[color:var(--color-ink-soft)] border-b border-[color:var(--color-border)]">
            <tr>
              <th className="text-left py-2">Identität</th>
              <th className="text-left">Rolle</th>
              <th className="text-left">Profil</th>
              <th className="text-left">Gelöscht</th>
              <th className="text-right">Restzeit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const remaining = Math.max(
                0,
                Math.ceil(
                  (30 * 24 * 60 * 60 * 1000 -
                    (Date.now() - u.deletedAt!.getTime())) /
                    (24 * 60 * 60 * 1000)
                )
              );
              const stripped = (v: string | null): string | null => {
                if (!v) return v;
                const m = v.match(/^_deleted_\d+_(.+)$/);
                return m ? m[1] : v;
              };
              return (
                <tr
                  key={u.id}
                  className="border-b border-[color:var(--color-border)] last:border-b-0"
                >
                  <td className="py-2">
                    <div className="font-mono text-xs">
                      {stripped(u.email) ?? stripped(u.phone) ?? stripped(u.telegramId) ?? "—"}
                    </div>
                    <div className="text-[10px] text-[color:var(--color-ink-soft)]">
                      {u.id.slice(0, 8)}…
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="text-xs">
                    {u.candidate
                      ? `${u.candidate.firstName ?? ""} ${u.candidate.lastName ?? ""}`.trim() || "—"
                      : u.company
                        ? u.company.companyName
                        : "—"}
                  </td>
                  <td className="text-xs text-[color:var(--color-ink-soft)]">
                    {u.deletedAt!.toLocaleString("de-DE")}
                  </td>
                  <td className="text-right text-xs">
                    {remaining > 0 ? (
                      <span className="badge bg-amber-100 text-amber-800">
                        {remaining} Tage
                      </span>
                    ) : (
                      <span className="badge bg-rose-100 text-rose-800">
                        überfällig
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <RestoreButton userId={u.id} />
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[color:var(--color-ink-soft)]">
                  Keine soft-gelöschten User. 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
