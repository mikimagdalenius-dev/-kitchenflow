import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, roleLabel } from "@/lib/auth";
import { iniciarSesionAction, verificarPinAction } from "./actions";
import { UserPicker } from "./user-picker";

export const dynamic = "force-dynamic";

export default async function AccesoPage({
  searchParams
}: {
  searchParams?: Promise<{ volverA?: string; step?: string; error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const rawVolverA = params.volverA ?? "";
  const volverA = rawVolverA.startsWith("/") && !rawVolverA.startsWith("//") ? rawVolverA : "/usuarios";

  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect(volverA !== "/acceso" ? volverA : "/usuarios");
  }

  if (params.step === "pin") {
    return (
      <section className="acceso-wrap">
        <div className="acceso-box page-stack">
          <div className="page-header">
            <h1 className="page-title">PIN de admin</h1>
            <p className="page-subtitle">Introduce tu PIN para continuar.</p>
          </div>

          <form action={verificarPinAction} className="pc-card p-6 space-y-4">
            <input type="hidden" name="volverA" value={volverA} />

            {params.error === "pin" && (
              <div className="pc-toast pc-toast-error">❌ PIN incorrecto. Inténtalo de nuevo.</div>
            )}
            {params.error === "bloqueado" && (
              <div className="pc-toast pc-toast-error">🔒 Demasiados intentos fallidos. Espera 15 minutos.</div>
            )}

            <input
              type="password"
              name="pin"
              className="pc-select acceso-input"
              placeholder="PIN"
              autoFocus
              autoComplete="off"
              maxLength={20}
            />

            <button className="pc-btn acceso-btn" type="submit">
              Confirmar
            </button>

            <a
              href="/acceso"
              className="block text-center text-sm text-slate-500 hover:text-slate-700"
            >
              ← Volver a selección de usuario
            </a>
          </form>
        </div>
      </section>
    );
  }

  const usersRaw = await prisma.user
    .findMany({
      where: { active: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, role: true }
    })
    .catch(() => []);

  const users = usersRaw.map((u) => ({ ...u, role: roleLabel[u.role] ?? u.role }));

  return (
    <section className="acceso-wrap">
      <div className="acceso-box page-stack">
        <div className="page-header">
          <h1 className="page-title">Acceso</h1>
          <p className="page-subtitle">Selecciona el usuario para entrar en la aplicación.</p>
        </div>

        <form action={iniciarSesionAction} className="pc-card p-6 space-y-4">
          <input type="hidden" name="volverA" value={volverA} />
          <UserPicker users={users} />
          <button className="pc-btn acceso-btn" type="submit" disabled={users.length === 0}>
            Entrar
          </button>
          {users.length === 0 && (
            <p className="text-xs text-slate-500">
              No hay usuarios cargados todavía. Ejecuta la inicialización de BD y el seed demo.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
