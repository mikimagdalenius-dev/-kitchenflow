"use server";

import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { startOfMadridDay, madridTimeToUtc } from "@/lib/dates";

export async function deleteAttendanceLogAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  const id = Number(formData.get("id"));
  const month = String(formData.get("month") ?? "");
  if (!id) redirect(`/reportes${month ? `?month=${month}` : ""}`);
  await prisma.attendanceLog.delete({ where: { id } }).catch(() => null);
  redirect(`/reportes${month ? `?month=${month}` : ""}`);
}

export async function addManualAttendanceAction(formData: FormData) {
  await requireRole([Role.ADMIN]);
  const userId = Number(formData.get("userId"));
  const dateStr = String(formData.get("date") ?? "");
  const timeStr = String(formData.get("time") || "09:00");
  const month = String(formData.get("month") ?? "");

  if (!userId || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    redirect(`/reportes${month ? `?month=${month}` : ""}`);
  }

  const attendedDate = startOfMadridDay(new Date(`${dateStr}T12:00:00Z`));
  const attendedAt = madridTimeToUtc(dateStr, timeStr);

  await prisma.attendanceLog.upsert({
    where: { userId_attendedDate_service: { userId, attendedDate, service: "lunch" } },
    update: { attendedAt, source: "admin" },
    create: { userId, attendedDate, attendedAt, service: "lunch", source: "admin" }
  });

  redirect(`/reportes${month ? `?month=${month}` : ""}`);
}
