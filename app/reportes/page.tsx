import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccess, getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendanceChart } from "@/components/ui/attendance-chart";
import { formatDateTimeEs, monthValue, parseDateInput, startOfMadridDay } from "@/lib/dates";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function ReportesPage({
  searchParams
}: {
  searchParams?: Promise<{ month?: string; userId?: string; fromDate?: string; toDate?: string; page?: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return (
      <section className="pc-card p-4">
        <p className="text-sm text-slate-700">
          Necesitas iniciar sesión para ver reportes. <Link href="/acceso?volverA=/reportes">Ir a acceso</Link>
        </p>
      </section>
    );
  }

  if (!canAccess(sessionUser.role, [Role.HR, Role.ADMIN, Role.COOK])) {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const selected = params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : monthValue(new Date());
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [year, month] = selected.split("-").map(Number);
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 1));

  const todayStart = startOfMadridDay(new Date());
  const weekDay = new Date().getDay();
  const daysSinceMonday = (weekDay + 6) % 7;
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const previousWeekStart = new Date(weekStart);
  previousWeekStart.setUTCDate(previousWeekStart.getUTCDate() - 7);

  const filterUserId = Number(params.userId);
  const hasUserFilter = Number.isFinite(filterUserId) && filterUserId > 0;
  const filterFrom = parseDateInput(params.fromDate);
  const filterToRaw = parseDateInput(params.toDate);
  const filterTo = filterToRaw ? new Date(Date.UTC(filterToRaw.getUTCFullYear(), filterToRaw.getUTCMonth(), filterToRaw.getUTCDate() + 1)) : null;

  const recentWhere = {
    ...(hasUserFilter ? { userId: filterUserId } : {}),
    ...(filterFrom || filterTo
      ? {
          attendedDate: {
            ...(filterFrom ? { gte: filterFrom } : {}),
            ...(filterTo ? { lt: filterTo } : {})
          }
        }
      : {})
  };

  const exportParams = new URLSearchParams({ month: selected });
  const cloudExcelUrl = process.env.NEXT_PUBLIC_ATTENDANCE_EXCEL_URL?.trim() ?? null;
  if (hasUserFilter) exportParams.set("userId", String(filterUserId));
  if (params.fromDate) exportParams.set("fromDate", params.fromDate);
  if (params.toDate) exportParams.set("toDate", params.toDate);

  const [totalLogs, thisMonthLogs, todayLogs, weekLogs, previousWeekLogs, monthUniqueUsers, peakHourRows, users, recentLogs, recentTotal, dailyCounts] = await Promise.all([
    prisma.attendanceLog.count().catch(() => 0),
    prisma.attendanceLog.count({ where: { attendedDate: { gte: from, lt: to } } }).catch(() => 0),
    prisma.attendanceLog.count({ where: { attendedDate: todayStart } }).catch(() => 0),
    prisma.attendanceLog.count({ where: { attendedDate: { gte: weekStart, lt: tomorrowStart } } }).catch(() => 0),
    prisma.attendanceLog.count({ where: { attendedDate: { gte: previousWeekStart, lt: weekStart } } }).catch(() => 0),
    prisma.attendanceLog
      .findMany({ where: { attendedDate: { gte: from, lt: to } }, select: { userId: true }, distinct: ["userId"] })
      .then((rows) => rows.length)
      .catch(() => 0),
    prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
      SELECT EXTRACT(HOUR FROM "attendedAt" AT TIME ZONE 'Europe/Madrid')::int AS hour,
             COUNT(*)::bigint AS count
      FROM "AttendanceLog"
      WHERE "attendedDate" >= ${from} AND "attendedDate" < ${to}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `.catch(() => []),
    prisma.user.findMany({ where: { active: true }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }).catch(() => []),
    prisma.attendanceLog.findMany({
      where: recentWhere,
      include: { user: { select: { fullName: true } } },
      orderBy: { attendedAt: "desc" },
      take: PAGE_SIZE,
      skip
    }).catch(() => []),
    prisma.attendanceLog.count({ where: recentWhere }).catch(() => 0),
    prisma.attendanceLog.groupBy({
      by: ["attendedDate"],
      where: { attendedDate: { gte: from, lt: to } },
      _count: { _all: true },
      orderBy: { attendedDate: "asc" }
    }).catch(() => [])
  ]);

  // Generar todos los días del mes para la gráfica
  const daysInMonth: Date[] = [];
  const cursor = new Date(from);
  while (cursor < to) {
    daysInMonth.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  const countByDate = new Map(dailyCounts.map((d) => [d.attendedDate.toISOString(), d._count._all]));
  const chartData = daysInMonth.map((d) => ({ date: d, count: countByDate.get(d.toISOString()) ?? 0 }));

  const weekDelta = weekLogs - previousWeekLogs;
  const weekDeltaText =
    weekDelta === 0 ? "Igual que la semana pasada" : weekDelta > 0 ? `+${weekDelta} vs semana pasada` : `${weekDelta} vs semana pasada`;

  const peakHour = peakHourRows[0];
  const peakHourLabel = peakHour ? `${String(peakHour.hour).padStart(2, "0")}:00 (${Number(peakHour.count)})` : "Sin datos";

  const totalPages = Math.max(1, Math.ceil(recentTotal / PAGE_SIZE));

  const pageParams = (p: number) => {
    const sp = new URLSearchParams({ month: selected });
    if (hasUserFilter) sp.set("userId", String(filterUserId));
    if (params.fromDate) sp.set("fromDate", params.fromDate);
    if (params.toDate) sp.set("toDate", params.toDate);
    if (p > 1) sp.set("page", String(p));
    return sp.toString();
  };

  return (
    <section className="page-stack text-center">
      <PageHeader title="Fichajes y exportación" subtitle="Resumen y exportación mensual de fichajes (totales por empleado)." />

      <form className="pc-card p-4 flex flex-wrap items-end justify-center gap-3" method="GET">
        <label className="text-sm text-slate-600 text-left">
          Mes
          <input type="month" name="month" defaultValue={selected} className="pc-select mt-1" />
        </label>
        <button className="pc-btn" type="submit">Actualizar</button>
        {cloudExcelUrl && (
          <Link className="pc-btn pc-btn-secondary hover:no-underline" href={cloudExcelUrl} target="_blank" rel="noopener noreferrer">
            Excel RRHH (cloud)
          </Link>
        )}
        <Link className="pc-btn pc-btn-secondary hover:no-underline" href={`/reportes/export?${exportParams.toString()}`}>
          Descargar copia
        </Link>
      </form>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 pc-stagger">
        <StatCard label="Fichajes hoy" value={todayLogs} />
        <StatCard label="Fichajes esta semana" value={weekLogs} hint={weekDeltaText} />
        <StatCard label={`Fichajes del mes (${selected})`} value={thisMonthLogs} />
        <StatCard label="Personas únicas del mes" value={monthUniqueUsers} />
        <StatCard label="Hora pico del mes" value={peakHourLabel} />
        <StatCard label="Fichajes históricos" value={totalLogs} />
      </div>

      {chartData.length > 0 && (
        <div className="pc-card p-4 text-left space-y-2">
          <h2 className="text-base font-semibold text-slate-700 text-center">Asistencia diaria — {selected}</h2>
          <AttendanceChart data={chartData} />
        </div>
      )}

      <div className="pc-card p-4 text-left space-y-3">
        <h2 className="text-lg font-semibold text-slate-800 text-center">Últimos fichajes</h2>

        <form className="grid gap-3 md:grid-cols-4" method="GET">
          <input type="hidden" name="month" value={selected} />
          <label className="text-sm text-slate-600">
            Empleado
            <select name="userId" defaultValue={hasUserFilter ? String(filterUserId) : ""} className="pc-select mt-1">
              <option value="">Todos</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Desde
            <input type="date" name="fromDate" defaultValue={params.fromDate ?? ""} className="pc-select mt-1" />
          </label>
          <label className="text-sm text-slate-600">
            Hasta
            <input type="date" name="toDate" defaultValue={params.toDate ?? ""} className="pc-select mt-1" />
          </label>
          <div className="flex items-end gap-2">
            <button className="pc-btn" type="submit">Filtrar</button>
            <Link className="pc-btn pc-btn-secondary hover:no-underline" href={`/reportes?month=${selected}`}>Limpiar</Link>
          </div>
        </form>

        {recentLogs.length === 0 ? (
          <EmptyState message="No hay fichajes con esos filtros." />
        ) : (
          <>
            <div className="overflow-auto">
              <table className="w-full text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-2">Fecha y hora</th>
                    <th className="text-left px-2">Empleado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="bg-white border border-slate-200">
                      <td className="px-2 py-2">{formatDateTimeEs(new Date(log.attendedAt))}</td>
                      <td className="px-2 py-2 font-medium text-slate-800">{log.user.fullName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                {page > 1 ? (
                  <Link className="pc-btn pc-btn-secondary hover:no-underline" href={`/reportes?${pageParams(page - 1)}`}>← Anterior</Link>
                ) : (
                  <span className="pc-btn pc-btn-secondary opacity-40 cursor-not-allowed">← Anterior</span>
                )}
                <span className="text-sm text-slate-500">Página {page} de {totalPages}</span>
                {page < totalPages ? (
                  <Link className="pc-btn pc-btn-secondary hover:no-underline" href={`/reportes?${pageParams(page + 1)}`}>Siguiente →</Link>
                ) : (
                  <span className="pc-btn pc-btn-secondary opacity-40 cursor-not-allowed">Siguiente →</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
