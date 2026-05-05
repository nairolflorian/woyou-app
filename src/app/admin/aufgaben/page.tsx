import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TaskRow } from "@/components/TaskRow";

export default async function AdminAufgaben() {
  const tasks = await prisma.adminTask.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    include: { candidate: true, company: true, assignedTo: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Aufgaben</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        To-dos rund um Vermittlungen — z.B. Visum, Dokumente, Kontaktaufnahme.
      </p>
      <div className="mt-6 space-y-3">
        {tasks.map((t) => (
          <TaskRow
            key={t.id}
            id={t.id}
            kind={t.kind}
            title={t.title}
            status={t.status}
            candidateName={t.candidate ? `${t.candidate.firstName ?? "—"} ${t.candidate.lastName ?? ""}` : null}
            candidateId={t.candidateId}
            companyName={t.company?.companyName ?? null}
            companyId={t.companyId}
          />
        ))}
        {tasks.length === 0 && (
          <div className="card text-[color:var(--color-ink-soft)]">Keine offenen Aufgaben. 🎉</div>
        )}
      </div>
    </div>
  );
}

void Link;
