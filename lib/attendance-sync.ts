import { logError } from "@/lib/logger";

export async function syncAttendanceToExcel(params: {
  attendanceId: number;
  userId: number;
  fullName: string;
  attendedAt: Date;
  attendedDate: Date;
  service: string;
  source: string;
}) {
  const webhookUrl = process.env.POWER_AUTOMATE_ATTENDANCE_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendanceId: params.attendanceId,
        userId: params.userId,
        empleado: params.fullName,
        attendedAt: params.attendedAt.toISOString(),
        attendedDate: params.attendedDate.toISOString(),
        servicio: params.service,
        origen: params.source,
        timezone: "Europe/Madrid",
        app: "kitchenflow"
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logError("attendance.syncToExcel", new Error("Webhook response not ok"), {
        status: response.status,
        errorBody,
        attendanceId: params.attendanceId
      });
    }
  } catch (error) {
    logError("attendance.syncToExcel", error, { attendanceId: params.attendanceId });
  }
}
