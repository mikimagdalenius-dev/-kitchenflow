"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { parsePositiveInt } from "@/lib/validation";
import { logError } from "@/lib/logger";
import { startOfMadridDay } from "@/lib/dates";
import { syncAttendanceToExcel } from "@/lib/attendance-sync";

async function registrarFichaje(formData: FormData, returnPath: "/fichar") {
  await requireRole([Role.ADMIN, Role.KIOSK]);

  const userId = parsePositiveInt(formData.get("userId"));

  if (!userId) {
    redirect(`${returnPath}?status=nombre-invalido`);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, active: true }
  });

  if (!user || !user.active) {
    redirect(`${returnPath}?status=nombre-invalido`);
  }

  const service = "lunch";
  const now = new Date();
  const attendedDate = startOfMadridDay(now);

  const existing = await prisma.attendanceLog.findUnique({
    where: {
      userId_attendedDate_service: {
        userId: user.id,
        attendedDate,
        service
      }
    },
    select: { id: true }
  });

  if (existing) {
    redirect(`${returnPath}?status=duplicado&name=${encodeURIComponent(user.fullName)}`);
  }

  try {
    const created = await prisma.attendanceLog.create({
      data: {
        userId: user.id,
        service,
        attendedAt: now,
        attendedDate,
        source: "kiosk"
      }
    });

    await syncAttendanceToExcel({
      attendanceId: created.id,
      userId: user.id,
      fullName: user.fullName,
      attendedAt: now,
      attendedDate,
      service,
      source: "kiosk"
    });
  } catch (error) {
    logError("fichar.registrarFichaje", error, { userId: user.id, service });
    redirect(`${returnPath}?status=error`);
  }

  revalidatePath("/fichar");
  revalidatePath("/usuarios");
  revalidatePath("/reportes");

  redirect(`${returnPath}?status=ok&name=${encodeURIComponent(user.fullName)}`);
}

export async function quickLogAttendanceAction(formData: FormData) {
  await registrarFichaje(formData, "/fichar");
}
