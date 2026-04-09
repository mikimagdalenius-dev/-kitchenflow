import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { startOfMadridDay } from "@/lib/dates";
import { syncAttendanceToExcel } from "@/lib/attendance-sync";

export type AttendanceResult = "ok" | "duplicado" | "error";

export async function recordAttendance(
  userId: number,
  fullName: string,
  source: string
): Promise<AttendanceResult> {
  const service = "lunch";
  const now = new Date();
  const attendedDate = startOfMadridDay(now);

  const existing = await prisma.attendanceLog.findUnique({
    where: { userId_attendedDate_service: { userId, attendedDate, service } },
    select: { id: true }
  });

  if (existing) return "duplicado";

  try {
    const created = await prisma.attendanceLog.create({
      data: { userId, service, attendedAt: now, attendedDate, source }
    });

    await syncAttendanceToExcel({
      attendanceId: created.id,
      userId,
      fullName,
      attendedAt: now,
      attendedDate,
      service,
      source
    });

    return "ok";
  } catch (error) {
    logError("attendance.recordAttendance", error, { userId, service, source });
    return "error";
  }
}
