import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const roleLabel: Record<Role, string> = {
  EMPLOYEE: "Empleado",
  COOK: "Cocinero",
  ADMIN: "Administrador",
  HR: "RRHH",
  KIOSK: "fichajes_iPad"
};

export function canAccess(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("kf_user_id")?.value;
  const userId = raw ? Number(raw) : NaN;

  if (!Number.isFinite(userId)) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, role: true, active: true }
  });
}

export async function requireRole(allowed: Role[]) {
  const user = await getSessionUser();
  if (!user || !user.active || !canAccess(user.role, allowed)) {
    throw new Error("NO_AUTORIZADO");
  }
  return user;
}
