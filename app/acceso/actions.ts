"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function iniciarSesionAction(formData: FormData) {
  const userId = Number(formData.get("userId"));
  const volverA = String(formData.get("volverA") ?? "/usuarios");

  if (!Number.isFinite(userId)) return;

  const cookieStore = await cookies();
  cookieStore.set("kf_user_id", String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

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
  cookieStore.delete("kf_user_id");
  redirect("/acceso");
}
