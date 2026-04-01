import { prisma } from "@/lib/prisma";

export async function logAudit(
  scope: string,
  actor: { id: number; fullName: string; role: string },
  meta?: Record<string, unknown>
) {
  try {
    await prisma.errorLog.create({
      data: {
        scope: `audit.${scope}`,
        message: `${actor.fullName} (${actor.role})`,
        meta: {
          actorId: actor.id,
          actorName: actor.fullName,
          actorRole: actor.role,
          ...meta
        }
      }
    });
  } catch {
    // audit no debe romper flujos de negocio
  }
}
