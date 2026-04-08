"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function iniciarSesionAction(formData: FormData) {
  const userId = Number(formData.get("userId"));
  const rawVolverA = String(formData.get("volverA") ?? "");
  const volverA = rawVolverA.startsWith("/") && !rawVolverA.startsWith("//") ? rawVolverA : "/usuarios";

  if (!Number.isFinite(userId) || userId <= 0) return;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.userId = userId;
  await session.save();

  const requestedDestino = volverA && volverA !== "/" ? volverA : "/usuarios";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  const destino = requestedDestino === "/usuarios" && user?.role === Role.KIOSK ? "/fichar" : requestedDestino;
  redirect(destino);
}

export async function cerrarSesionAction() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.destroy();
  redirect("/acceso");
}
