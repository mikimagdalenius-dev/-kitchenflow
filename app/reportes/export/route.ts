import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { Prisma, Role } from "@prisma/client";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { formatDateOnlyEs, formatDateTimeEs, parseDateInput } from "@/lib/dates";

function buildExportParams(params: URLSearchParams) {
  const month = params.get("month");
  const selected = month && /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7);
  const [year, monthNum] = selected.split("-").map(Number);

  const monthFrom = new Date(Date.UTC(year, monthNum - 1, 1));
  const monthTo = new Date(Date.UTC(year, monthNum, 1));

  const filterUserId = Number(params.get("userId"));
  const hasUserFilter = Number.isFinite(filterUserId) && filterUserId > 0;

  const filterFrom = parseDateInput(params.get("fromDate"));
  const filterToRaw = parseDateInput(params.get("toDate"));
  const filterTo = filterToRaw
    ? new Date(Date.UTC(filterToRaw.getUTCFullYear(), filterToRaw.getUTCMonth(), filterToRaw.getUTCDate() + 1))
    : null;

  const where: Prisma.AttendanceLogWhereInput = {
    attendedDate: {
      gte: filterFrom ?? monthFrom,
      lt: filterTo ?? monthTo
    },
    ...(hasUserFilter ? { userId: filterUserId } : {})
  };

  return { selected, where };
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const rawUserId = cookieStore.get("kf_user_id")?.value;
  const userId = rawUserId ? Number(rawUserId) : NaN;

  if (!Number.isFinite(userId)) {
    return new Response("No autorizado", { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, active: true } });
  if (!user || !user.active || (user.role !== Role.HR && user.role !== Role.ADMIN && user.role !== Role.COOK)) {
    return new Response("No autorizado", { status: 403 });
  }

  const { selected, where } = buildExportParams(req.nextUrl.searchParams);

  const logs = await prisma.attendanceLog.findMany({
    where,
    include: {
      user: {
        select: { fullName: true }
      }
    },
    orderBy: { attendedAt: "desc" }
  });

  const totals = new Map<string, number>();
  for (const log of logs) {
    const key = log.user.fullName;
    totals.set(key, (totals.get(key) ?? 0) + 1);
  }

  const ordered = [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));

  const resumenRows = ordered.map(([empleado, totalFichajes]) => ({
    empleado,
    total_fichajes: totalFichajes
  }));

  const detalleRows = logs.map((log) => ({
    fecha: formatDateOnlyEs(log.attendedDate),
    fecha_hora: formatDateTimeEs(log.attendedAt),
    empleado: log.user.fullName,
    servicio: log.service
  }));

  const wb = XLSX.utils.book_new();
  const wsResumen = XLSX.utils.json_to_sheet(resumenRows);
  const wsDetalle = XLSX.utils.json_to_sheet(detalleRows);
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle");

  const wbBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(wbBuffer);

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fichajes-${selected}.xlsx"`
    }
  });
}
