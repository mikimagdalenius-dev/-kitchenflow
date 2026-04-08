import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, roleLabel } from "@/lib/auth";
import { iniciarSesionAction } from "./actions";
import { UserPicker } from "./user-picker";

export const dynamic = "force-dynamic";

export default async function AccesoPage({
  searchParams
}: {
  searchParams?: Promise<{ volverA?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const rawVolverA = params.volverA ?? "";
  const volverA = rawVolverA.startsWith("/") && !rawVolverA.startsWith("//") ? rawVolverA : "/usuarios";

  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect(volverA !== "/acceso" ? volverA : "/usuarios");
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
        <button className="pc-btn acceso-btn" type="submit" disabled={users.length === 0} style={{ background: "#000" }}>
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
