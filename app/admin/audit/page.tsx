import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDateTimeEs } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const sessionUser = await requireRole([Role.ADMIN]).catch(() => null);
  if (!sessionUser) redirect("/acceso?volverA=/admin/audit");

  const rows = await prisma.errorLog.findMany({
    where: { scope: { startsWith: "audit." } },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <section className="page-stack">
      <div className="page-header text-center">
        <h1 className="page-title">Historial de cambios</h1>
        <p className="page-subtitle">Solo admins · últimos 200 cambios registrados</p>
      </div>

      <div className="pc-card p-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-600">
            <tr>
              <th className="p-2">Fecha</th>
              <th className="p-2">Acción</th>
              <th className="p-2">Quién</th>
              <th className="p-2">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-dashed border-slate-200 align-top">
                <td className="p-2 whitespace-nowrap">{formatDateTimeEs(new Date(r.createdAt))}</td>
                <td className="p-2">{r.scope.replace("audit.", "")}</td>
                <td className="p-2">{r.message}</td>
                <td className="p-2 text-slate-600">
                  <pre className="whitespace-pre-wrap break-words text-xs m-0">{JSON.stringify(r.meta ?? {}, null, 2)}</pre>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-slate-500" colSpan={4}>
                  Aún no hay cambios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
