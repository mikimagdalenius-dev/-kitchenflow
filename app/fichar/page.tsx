import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccess, getSessionUser } from "@/lib/auth";
import { formatUserName } from "@/lib/ui";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { FicharPicker } from "./fichar-picker";
import { quickLogAttendanceAction } from "./actions";
import { FicharReset } from "./fichar-reset";

export const dynamic = "force-dynamic";

export default async function FicharPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; name?: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/acceso?volverA=/fichar");
  }
  if (!canAccess(sessionUser.role, [Role.ADMIN, Role.KIOSK])) {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const hasStatus = Boolean(params.status);
  const name = formatUserName(params.name ?? "");

  const users = await prisma.user
    .findMany({
      where: { active: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true }
    })
    .catch(() => []);

  const isOk = params.status === "ok";
  const isDuplicated = params.status === "duplicado";

  return (
    <section className="kiosk-page">
      <FicharReset active={hasStatus} delay={isOk || isDuplicated ? 3500 : 2200} />
      <div className="kiosk-wrap">
        {sessionUser.role === Role.ADMIN && (
          <div className="kiosk-admin-exit-wrap">
            <a href="/usuarios" className="pc-btn pc-btn-secondary kiosk-admin-exit">Salir del modo fichaje</a>
          </div>
        )}

        {isOk ? (
          <div className="kiosk-confirm kiosk-confirm-ok">
            <div className="kiosk-confirm-icon">✅</div>
            <div className="kiosk-confirm-name">{name}</div>
            <div className="kiosk-confirm-msg">Fichaje registrado correctamente</div>
          </div>
        ) : isDuplicated ? (
          <div className="kiosk-confirm kiosk-confirm-dup">
            <div className="kiosk-confirm-icon">ℹ️</div>
            <div className="kiosk-confirm-name">{name}</div>
            <div className="kiosk-confirm-msg">Ya has fichado hoy</div>
          </div>
        ) : (
          <>
            <h1 className="kiosk-title">Fichaje comedor</h1>
            <p className="kiosk-subtitle">Escribe tu nombre y pulsa fichar</p>

            {params.status === "nombre-invalido" && (
              <div className="pc-toast pc-toast-error kiosk-toast">❌ Selecciona un nombre válido de la lista.</div>
            )}
            {params.status === "error" && (
              <div className="pc-toast pc-toast-error kiosk-toast">❌ No se ha podido registrar el fichaje. Inténtalo de nuevo.</div>
            )}

            <form action={quickLogAttendanceAction} className="pc-card kiosk-card">
              <FicharPicker users={users} autoFocus inputClassName="kiosk-input" />
              <div className="flex justify-center">
                <FormSubmitButton idleText="Fichar" pendingText="Fichando..." className="kiosk-btn" />
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
