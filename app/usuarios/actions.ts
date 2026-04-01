"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeName, normalizeOptionalEmail, parsePositiveInt } from "@/lib/validation";
import { logError } from "@/lib/logger";
import { logAudit } from "@/lib/audit";
import { syncAttendanceToExcel } from "@/lib/attendance-sync";

function esErrorUnico(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function parseAllergenIds(formData: FormData) {
  const ids = formData
    .getAll("allergenIds")
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0);

  return [...new Set(ids)];
}

export async function updateMyIntolerancesAction(formData: FormData) {
  const sessionUser = await requireRole([Role.EMPLOYEE, Role.COOK, Role.ADMIN, Role.HR, Role.KIOSK]);
  const allergenIds = parseAllergenIds(formData);
  const customTextRaw = String(formData.get("customIntolerances") ?? "");
  const customText = customTextRaw.trim();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userIntolerance.deleteMany({ where: { userId: sessionUser.id } });

      if (allergenIds.length > 0) {
        await tx.userIntolerance.createMany({
          data: allergenIds.map((allergenId) => ({ userId: sessionUser.id, allergenId })),
          skipDuplicates: true
        });
      }

      if (customText) {
        const other = await tx.allergen.upsert({
          where: { code: "OTROS" },
          update: { name: "Otros (texto libre)" },
          create: { code: "OTROS", name: "Otros (texto libre)" },
          select: { id: true }
        });

        await tx.userIntolerance.upsert({
          where: { userId_allergenId: { userId: sessionUser.id, allergenId: other.id } },
          update: { notes: customText.slice(0, 300) },
          create: { userId: sessionUser.id, allergenId: other.id, notes: customText.slice(0, 300) }
        });
      }
    });
  } catch (error) {
    logError("usuarios.updateMyIntolerancesAction", error, { userId: sessionUser.id });
    redirect("/usuarios?alergias=error");
  }

  await logAudit("usuarios.updateMyIntolerances", sessionUser, {
    allergenIds,
    hasCustomText: Boolean(customText)
  });

  revalidatePath("/usuarios");
  redirect("/usuarios?alergias=ok");
}

export async function createUserAction(formData: FormData) {
  const sessionUser = await requireRole([Role.ADMIN]);

  const fullName = normalizeName(formData.get("fullName"));
  const email = normalizeOptionalEmail(formData.get("email"));
  const roleRaw = String(formData.get("role") ?? "EMPLOYEE");
  const allergenIds = parseAllergenIds(formData);

  if (!fullName && formData.get("fullName") !== null) {
    redirect("/usuarios?user=error-validacion");
  }
  if (!fullName) {
    redirect("/usuarios?user=error-validacion");
  }
  if (formData.get("email") && !email) {
    redirect("/usuarios?user=error-validacion");
  }

  const role = Object.values(Role).includes(roleRaw as Role) ? (roleRaw as Role) : Role.EMPLOYEE;

  try {
    const created = await prisma.user.create({
      data: {
        fullName,
        email,
        role
      },
      select: { id: true }
    });

    if (allergenIds.length > 0) {
      await prisma.userIntolerance.createMany({
        data: allergenIds.map((allergenId) => ({ userId: created.id, allergenId })),
        skipDuplicates: true
      });
    }

    await logAudit("usuarios.create", sessionUser, {
      targetUserId: created.id,
      fullName,
      email,
      role,
      allergenIds
    });
  } catch (error) {
    if (esErrorUnico(error)) {
      redirect("/usuarios?user=error-email-duplicado");
    }
    logError("usuarios.createUserAction", error, { roleRaw, fullName });
    redirect("/usuarios?user=error-generico");
  }

  revalidatePath("/usuarios");
  revalidatePath("/acceso");
  redirect("/usuarios?user=created");
}

function inicioDelDia(fecha: Date) {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function logAttendanceAction(formData: FormData) {
  const sessionUser = await requireRole([Role.EMPLOYEE, Role.COOK, Role.ADMIN, Role.HR]);

  const userId = sessionUser.id;
  const service = "lunch";

  const ahora = new Date();
  const attendedDate = inicioDelDia(ahora);

  const existente = await prisma.attendanceLog.findUnique({
    where: {
      userId_attendedDate_service: {
        userId,
        attendedDate,
        service
      }
    },
    select: { id: true }
  });

  if (existente) {
    redirect("/usuarios?fichaje=duplicado");
  }

  try {
    const created = await prisma.attendanceLog.create({
      data: {
        userId,
        service,
        attendedAt: ahora,
        attendedDate
      }
    });

    const usuario = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    await syncAttendanceToExcel({
      attendanceId: created.id,
      userId,
      fullName: usuario?.fullName ?? `user-${userId}`,
      attendedAt: ahora,
      attendedDate,
      service,
      source: "app"
    });
  } catch (error) {
    logError("usuarios.logAttendanceAction", error, { userId, service });
    redirect("/usuarios?fichaje=error");
  }

  revalidatePath("/usuarios");
  revalidatePath("/reportes");
  redirect("/usuarios?fichaje=ok");
}

export async function updateUserAction(formData: FormData) {
  const sessionUser = await requireRole([Role.ADMIN]);

  const userId = parsePositiveInt(formData.get("userId"));
  const fullName = normalizeName(formData.get("fullName"));
  const email = normalizeOptionalEmail(formData.get("email"));
  const roleRaw = String(formData.get("role") ?? "EMPLOYEE");
  const allergenIds = parseAllergenIds(formData);

  if (!userId || !fullName) {
    redirect("/usuarios?user=error-validacion");
  }
  if (formData.get("email") && !email) {
    redirect("/usuarios?user=error-validacion");
  }

  const role = Object.values(Role).includes(roleRaw as Role) ? (roleRaw as Role) : Role.EMPLOYEE;

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          fullName,
          email,
          role
        }
      }),
      prisma.userIntolerance.deleteMany({ where: { userId } }),
      ...(allergenIds.length > 0
        ? [
            prisma.userIntolerance.createMany({
              data: allergenIds.map((allergenId) => ({ userId, allergenId })),
              skipDuplicates: true
            })
          ]
        : [])
    ]);

    await logAudit("usuarios.update", sessionUser, {
      targetUserId: userId,
      fullName,
      email,
      role,
      allergenIds
    });
  } catch (error) {
    if (esErrorUnico(error)) {
      redirect("/usuarios?user=error-email-duplicado");
    }
    logError("usuarios.updateUserAction", error, { userId, roleRaw });
    redirect("/usuarios?user=error-generico");
  }

  revalidatePath("/usuarios");
  revalidatePath("/acceso");
  revalidatePath("/reportes");
  redirect("/usuarios?user=updated");
}

export async function deleteUserAction(formData: FormData) {
  const sessionUser = await requireRole([Role.ADMIN]);
  const userId = parsePositiveInt(formData.get("userId"));

  if (!userId) {
    redirect("/usuarios?user=error-validacion");
  }
  if (userId === sessionUser.id) {
    redirect("/usuarios?user=error-no-autoborrar");
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });

  if (!target) {
    redirect("/usuarios?user=error-no-encontrado");
  }

  if (target.role === Role.ADMIN) {
    const admins = await prisma.user.count({ where: { role: Role.ADMIN, active: true } });
    if (admins <= 1) {
      redirect("/usuarios?user=error-ultimo-admin");
    }
  }

  try {
    await prisma.user.delete({ where: { id: userId } });

    await logAudit("usuarios.delete", sessionUser, {
      targetUserId: userId,
      targetRole: target.role
    });
  } catch (error) {
    logError("usuarios.deleteUserAction", error, { userId });
    redirect("/usuarios?user=error-generico");
  }

  revalidatePath("/usuarios");
  revalidatePath("/acceso");
  revalidatePath("/reportes");
  redirect("/usuarios?user=deleted");
}
