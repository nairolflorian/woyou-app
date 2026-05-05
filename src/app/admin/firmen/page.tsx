import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminFirmen() {
  const companies = await prisma.company.findMany({
    include: { jobRequests: true, matches: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">Unternehmen</h1>
      <div className="mt-6 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-[color:var(--color-ink-soft)] border-b border-[color:var(--color-border)]">
            <tr>
              <th className="text-left py-2">Firma</th>
              <th className="text-left">Branche</th>
              <th className="text-left">Stadt</th>
              <th className="text-left">Anfragen</th>
              <th className="text-left">Vorschläge</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b border-[color:var(--color-border)]">
                <td className="py-2 font-semibold">{c.companyName}</td>
                <td>{c.industry ?? "—"}</td>
                <td>{c.city ?? "—"}</td>
                <td>{c.jobRequests.length}</td>
                <td>{c.matches.length}</td>
                <td className="text-right">
                  <Link href={`/admin/firmen/${c.id}`} className="text-[color:var(--color-brand)] font-semibold">Details →</Link>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-[color:var(--color-ink-soft)]">Noch keine Unternehmen.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
