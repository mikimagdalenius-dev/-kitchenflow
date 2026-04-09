"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { parsePositiveInt } from "@/lib/validation";
import { recordAttendance } from "@/lib/attendance";

async function registrarFichaje(formData: FormData, returnPath: "/fichar") {
  await requireRole([Role.ADMIN, Role.KIOSK]);

  const userId = parsePositiveInt(formData.get("userId"));
  if (!userId) redirect(`${returnPath}?status=nombre-invalido`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, active: true }
  });

  if (!user || !user.active) redirect(`${returnPath}?status=nombre-invalido`);

  const result = await recordAttendance(user!.id, user!.fullName, "kiosk");

  if (result === "duplicado") redirect(`${returnPath}?status=duplicado&name=${encodeURIComponent(user!.fullName)}`);
  if (result === "error") redirect(`${returnPath}?status=error`);

  revalidatePath("/fichar");
  revalidatePath("/usuarios");
  revalidatePath("/reportes");

  redirect(`${returnPath}?status=ok&name=${encodeURIComponent(user!.fullName)}`);
}

export async function quickLogAttendanceAction(formData: FormData) {
  await registrarFichaje(formData, "/fichar");
}
