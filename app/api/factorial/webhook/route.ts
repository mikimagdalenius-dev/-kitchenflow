import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { startOfMadridDay } from "@/lib/dates";
import { syncAttendanceToExcel } from "@/lib/attendance-sync";

export async function POST(req: NextRequest) {
  // Validar token secreto si está configurado
  const secret = req.headers.get("x-webhook-secret") ?? req.headers.get("x-factorial-signature");
  const expectedSecret = process.env.FACTORIAL_WEBHOOK_SECRET?.trim();

  if (expectedSecret && secret !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Loguear el payload para poder ajustar el parsing cuando conectemos Factorial
  logError("factorial.webhook.received", new Error("Payload recibido"), { payload });

  try {
    await handleFactorialEvent(payload);
  } catch (error) {
    logError("factorial.webhook.handle", error, { payload });
  }

  // Siempre responder 200 para que Factorial no reintente
  return new Response("OK", { status: 200 });
}

async function handleFactorialEvent(payload: unknown) {
  if (!payload || typeof payload !== "object") return;

  const p = payload as Record<string, unknown>;

  // Factorial puede enviar distintos formatos según la versión de la API
  // Aceptamos cualquier evento que parezca un fichaje de entrada
  const eventType = String(p.type ?? p.event ?? p.event_type ?? "").toLowerCase();
  if (
    !eventType.includes("clock_in") &&
    !eventType.includes("check_in") &&
    !eventType.includes("attendance") &&
    !eventType.includes("shift_start") &&
    eventType !== ""  // Si no hay tipo, intentamos procesar igualmente
  ) {
    return;
  }

  // Extraer datos del empleado del payload
  const data = (p.data ?? p.payload ?? p) as Record<string, unknown>;
  const employee = (data.employee ?? data) as Record<string, unknown>;

  const factorialId = String(employee.id ?? employee.employee_id ?? data.employee_id ?? "").trim();
  const email = String(employee.email ?? employee.work_email ?? data.email ?? "").toLowerCase().trim();
  const name = String(
    employee.full_name ?? employee.name ?? employee.employee_name ??
    `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim() ?? ""
  ).trim();

  // Buscar usuario por factorialId, email o nombre (en ese orden de prioridad)
  let user: { id: number; fullName: string; active: boolean; attendsCafeteria: boolean } | null = null;

  if (factorialId) {
    user = await prisma.user.findUnique({
      where: { factorialId },
      select: { id: true, fullName: true, active: true, attendsCafeteria: true }
    });
  }

  if (!user && email) {
    user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, fullName: true, active: true, attendsCafeteria: true }
    });
  }

  if (!user && name) {
    user = await prisma.user.findFirst({
      where: { fullName: { equals: name, mode: "insensitive" } },
      select: { id: true, fullName: true, active: true, attendsCafeteria: true }
    });
  }

  if (!user) {
    logError("factorial.webhook.no_match", new Error("No se encontró usuario"), { factorialId, email, name });
    return;
  }

  if (!user.active || !user.attendsCafeteria) return;

  const now = new Date();
  const attendedDate = startOfMadridDay(now);
  const service = "lunch";

  const existing = await prisma.attendanceLog.findUnique({
    where: { userId_attendedDate_service: { userId: user.id, attendedDate, service } },
    select: { id: true }
  });

  if (existing) return;

  const created = await prisma.attendanceLog.create({
    data: { userId: user.id, service, attendedAt: now, attendedDate, source: "factorial" }
  });

  await syncAttendanceToExcel({
    attendanceId: created.id,
    userId: user.id,
    fullName: user.fullName,
    attendedAt: now,
    attendedDate,
    service,
    source: "factorial"
  }).catch(() => null);
}
