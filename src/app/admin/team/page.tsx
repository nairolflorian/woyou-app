import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { getSession } from "@/lib/session";
import { TeamForm } from "@/components/TeamForm";

export default async function AdminTeam() {
  const session = await getSession();
  if (session.role !== ROLE.SUPER_ADMIN) redirect("/admin");
  const admins = await prisma.user.findMany({
    where: { role: { in: [ROLE.ADMIN, ROLE.SUPER_ADMIN] } },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">Team-Mitglieder</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        Vermittler:innen und Super-Admins für das Backend.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-3">Bestehende</h2>
          <ul className="space-y-2 text-sm">
            {admins.map((a) => (
              <li key={a.id} className="flex justify-between">
                <span>{a.email ?? a.phone ?? "—"}</span>
                <span className="badge bg-slate-100 text-slate-700">{a.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Neue:n Admin anlegen</h2>
          <TeamForm />
        </div>
      </div>
    </div>
  );
}
