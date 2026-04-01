import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { canAccess, getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { clearErrorLogsAction } from "./actions";
import { formatDateTimeEs } from "@/lib/dates";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

export const dynamic = "force-dynamic";

export default async function AdminDebugPage({
  searchParams
}: {
  searchParams?: Promise<{ cleared?: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/acceso?volverA=/admin/debug");
  }
  if (!canAccess(sessionUser.role, [Role.ADMIN])) {
    redirect("/");
  }

  const params = (await searchParams) ?? {};

  const logs = await prisma.errorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="page-stack">
      <PageHeader title="Debug de errores" subtitle="Últimos errores registrados por el sistema (solo admin)." />

      {params.cleared === "1" && <div className="pc-toast pc-toast-success">✅ Logs limpiados.</div>}

      <div className="pc-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">Total mostrando: {logs.length} (máx 100)</div>
        <div className="flex gap-2">
          <Link href="/reportes" className="pc-btn pc-btn-secondary hover:no-underline">
            Volver a reportes
          </Link>
          <Link href="/admin/audit" className="pc-btn pc-btn-secondary hover:no-underline">
            Ver historial
          </Link>
          <form action={clearErrorLogsAction}>
            <ConfirmSubmitButton
              buttonText="Limpiar logs"
              className="pc-btn pc-btn-secondary"
              firstConfirmText="¿Seguro que quieres borrar todo el histórico de logs?"
              secondPromptText="Escribe BORRAR para limpiar los logs"
              requiredWord="BORRAR"
            />
          </form>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="pc-empty">No hay errores registrados.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <article key={log.id} className="pc-card p-4 text-sm space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-slate-800">{log.scope}</strong>
                <span className="text-xs text-slate-500">{formatDateTimeEs(new Date(log.createdAt))}</span>
              </div>
              <div className="text-slate-700">{log.message}</div>
              {log.meta ? (
                <pre className="bg-slate-50 border border-slate-200 rounded p-2 overflow-auto text-xs">{JSON.stringify(log.meta, null, 2)}</pre>
              ) : null}
              {log.stack ? (
                <details>
                  <summary className="cursor-pointer text-xs text-slate-600">Ver stack</summary>
                  <pre className="mt-2 bg-slate-50 border border-slate-200 rounded p-2 overflow-auto text-xs">{log.stack}</pre>
                </details>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
