"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sessionOptions, type SessionData } from "@/lib/session";

const ADMIN_PIN = process.env.ADMIN_PIN!;

export async function iniciarSesionAction(formData: FormData) {
  const userId = Number(formData.get("userId"));
  const rawVolverA = String(formData.get("volverA") ?? "");
  const volverA = rawVolverA.startsWith("/") && !rawVolverA.startsWith("//") ? rawVolverA : "/usuarios";

  if (!Number.isFinite(userId) || userId <= 0) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, active: true }
  });

  if (!user || !user.active) return;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (user.role === Role.ADMIN) {
    session.pendingUserId = userId;
    await session.save();
    redirect(`/acceso?step=pin&volverA=${encodeURIComponent(volverA)}`);
  }

  session.userId = userId;
  await session.save();

  const destino = volverA !== "/" ? volverA : "/usuarios";
  redirect(user.role === Role.KIOSK && destino === "/usuarios" ? "/fichar" : destino);
}

const PIN_MAX_ATTEMPTS = 5;
const PIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

export async function verificarPinAction(formData: FormData) {
  const pin = String(formData.get("pin") ?? "");
  const rawVolverA = String(formData.get("volverA") ?? "");
  const volverA = rawVolverA.startsWith("/") && !rawVolverA.startsWith("//") ? rawVolverA : "/usuarios";

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.pendingUserId) {
    redirect("/acceso");
  }

  const since = new Date(Date.now() - PIN_WINDOW_MS);
  const recentFailures = await prisma.errorLog.count({
    where: {
      scope: "pin.failed",
      createdAt: { gte: since },
      message: String(session.pendingUserId)
    }
  });

  if (recentFailures >= PIN_MAX_ATTEMPTS) {
    redirect(`/acceso?step=pin&volverA=${encodeURIComponent(volverA)}&error=bloqueado`);
  }

  if (pin !== ADMIN_PIN) {
    await prisma.errorLog.create({
      data: { scope: "pin.failed", message: String(session.pendingUserId) }
    });
    redirect(`/acceso?step=pin&volverA=${encodeURIComponent(volverA)}&error=pin`);
  }

  session.userId = session.pendingUserId;
  session.pendingUserId = undefined;
  await session.save();

  redirect(volverA !== "/acceso" ? volverA : "/usuarios");
}

export async function cerrarSesionAction() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.destroy();
  redirect("/acceso");
}
