import Link from "next/link";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccess, getSessionUser } from "@/lib/auth";
import { formatUserName } from "@/lib/ui";
import { createUserAction, updateMyIntolerancesAction } from "./actions";
import { AdminUserManager } from "./admin-user-manager";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

export const dynamic = "force-dynamic";

function inicioDelDia(fecha: Date) {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function UsuariosPage({
  searchParams
}: {
  searchParams?: Promise<{ user?: string; alergias?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return (
      <section className="pc-card p-4">
        <p className="text-sm text-slate-700">
          Necesitas iniciar sesión para usar Usuarios. <Link href="/acceso?volverA=/usuarios">Ir a acceso</Link>
        </p>
      </section>
    );
  }

  const soloTablaFichajes = sessionUser.role === Role.COOK;
  const puedeGestionarUsuarios = canAccess(sessionUser.role, [Role.ADMIN]);

  const hoy = inicioDelDia(new Date());

  const [users, fichajesHoy, allergens, yo] = await Promise.all([
    prisma.user
      .findMany({
        orderBy: { fullName: "asc" },
        include: {
          _count: { select: { attendances: true } },
          intolerances: { select: { allergenId: true } }
        }
      })
      .catch(() => []),
    prisma.attendanceLog.findMany({
      where: { attendedDate: hoy },
      include: {
        user: {
          select: {
            fullName: true,
            intolerances: {
              select: {
                notes: true,
                allergen: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { attendedAt: "asc" }
    }),
    prisma.allergen.findMany({
      where: { code: { not: "OTROS" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        intolerances: {
          select: {
            allergenId: true,
            notes: true,
            allergen: { select: { code: true } }
          }
        }
      }
    })
  ]);

  const misAlergenos = yo?.intolerances.filter((i) => i.allergen.code !== "OTROS").map((i) => i.allergenId) ?? [];
  const misIntoleranciasTextoLibre =
    yo?.intolerances.find((i) => i.allergen.code === "OTROS")?.notes ?? "";

  return (
    <section className="page-stack text-center">
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <p className="page-subtitle">
          {soloTablaFichajes ? "Fichajes del día de hoy." : "Alta de empleados y gestión de usuarios."}
        </p>
      </div>

      {!soloTablaFichajes && (
        <>
          {params.alergias === "ok" && (
            <div className="pc-toast pc-toast-success">✅ Alergias/intolerancias actualizadas.</div>
          )}
          {params.alergias === "error" && (
            <div className="pc-toast pc-toast-error">❌ No se pudieron guardar las alergias/intolerancias.</div>
          )}

          {params.user === "created" && <div className="pc-toast pc-toast-success">✅ Usuario creado.</div>}
          {params.user === "updated" && <div className="pc-toast pc-toast-success">✅ Usuario actualizado.</div>}
          {params.user === "deleted" && <div className="pc-toast pc-toast-success">✅ Usuario borrado.</div>}
          {params.user === "error-email-duplicado" && (
            <div className="pc-toast pc-toast-error">❌ El correo ya está en uso por otro usuario.</div>
          )}
          {params.user === "error-validacion" && (
            <div className="pc-toast pc-toast-error">❌ Revisa los datos: faltan campos obligatorios o no son válidos.</div>
          )}
          {params.user === "error-no-autoborrar" && (
            <div className="pc-toast pc-toast-error">❌ No puedes borrarte a ti mismo.</div>
          )}
          {params.user === "error-ultimo-admin" && (
            <div className="pc-toast pc-toast-error">❌ No puedes borrar el último admin activo.</div>
          )}
          {params.user === "error-no-encontrado" && (
            <div className="pc-toast pc-toast-error">❌ El usuario ya no existe.</div>
          )}
          {params.user === "error-generico" && (
            <div className="pc-toast pc-toast-error">❌ No se pudo guardar el cambio. Inténtalo de nuevo.</div>
          )}

          <form
            action={updateMyIntolerancesAction}
            className={`pc-card users-self-card p-4 space-y-3 text-center mx-auto ${
              puedeGestionarUsuarios ? "users-self-card-admin" : "max-w-2xl"
            }`}
          >
            <h2 className="font-semibold text-slate-800">Mis alergias / intolerancias</h2>
            {allergens.length > 0 ? (
              <div className="grid gap-1 sm:grid-cols-2 text-left max-w-xl mx-auto">
                {allergens.map((a) => (
                  <label key={a.id} className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" name="allergenIds" value={a.id} defaultChecked={misAlergenos.includes(a.id)} />
                    {a.name}
                  </label>
                ))}
              </div>
            ) : null}

            <div className="max-w-xl mx-auto text-left">
              <label className="block text-sm text-slate-700 mb-1" htmlFor="customIntolerances">
                Escribe aquí alergias/intolerancias
              </label>
              <textarea
                id="customIntolerances"
                name="customIntolerances"
                defaultValue={misIntoleranciasTextoLibre}
                rows={3}
                className="pc-select w-full"
                placeholder="Ej: Histamina, picante muy fuerte, etc."
              />
            </div>

            <div className="flex justify-center">
              <FormSubmitButton idleText="Guardar mis alergias" pendingText="Guardando..." />
            </div>
          </form>

          {puedeGestionarUsuarios && <h2 className="text-xl font-semibold text-slate-800 text-center">Panel admin</h2>}

          <div className="users-admin-grid">
            {puedeGestionarUsuarios && (
              <form action={createUserAction} className="pc-card users-admin-card p-4 space-y-2 text-left">
                <h2 className="font-semibold text-slate-800 text-center">Nuevo usuario</h2>
                <input name="fullName" className="pc-select" placeholder="Nombre completo" required />
                <input name="email" className="pc-select" placeholder="Correo (opcional)" />
                <select name="role" className="pc-select" defaultValue="EMPLOYEE">
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="COOK">Cocinero</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="HR">RRHH</option>
                  <option value="KIOSK">fichajes_iPad</option>
                </select>

                {allergens.length > 0 && (
                  <fieldset className="rounded border border-slate-200 p-2">
                    <legend className="px-1 text-xs text-slate-500">Alergias / Intolerancias</legend>
                    <div className="grid gap-1 sm:grid-cols-2">
                      {allergens.map((a) => (
                        <label key={a.id} className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" name="allergenIds" value={a.id} />
                          {a.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                <FormSubmitButton idleText="Guardar usuario" pendingText="Guardando usuario..." />
              </form>
            )}

            {puedeGestionarUsuarios && (
              <AdminUserManager
                users={users.map((u) => ({
                  id: u.id,
                  fullName: u.fullName,
                  email: u.email,
                  role: u.role,
                  intoleranceIds: u.intolerances.map((i) => i.allergenId)
                }))}
                currentUserId={sessionUser.id}
                allergens={allergens}
              />
            )}
          </div>

          {puedeGestionarUsuarios && (
            <div className="flex justify-center">
              <a href="/usuarios/excel" className="pc-btn pc-btn-secondary">
                Descargar Excel de usuarios
              </a>
            </div>
          )}
        </>
      )}

      <div className="overflow-hidden rounded border border-dashed border-slate-300 bg-white">
        <table className="w-full text-sm text-center">
          <thead className="bg-slate-50 text-center text-slate-600">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Alergias / Intolerancias</th>
              <th className="p-3">Hora fichaje</th>
            </tr>
          </thead>
          <tbody>
            {fichajesHoy.map((f) => {
              const intolerancias = f.user.intolerances
                .map((i) => {
                  const esTextoLibre = i.allergen.name.toLowerCase().includes("texto libre");
                  if (esTextoLibre) return i.notes?.trim() || "";
                  return i.notes ? `${i.allergen.name}: ${i.notes}` : i.allergen.name;
                })
                .filter(Boolean)
                .join(", ");
              return (
                <tr key={f.id} className="border-t border-dashed border-slate-200">
                  <td className="p-3 font-medium text-slate-800">{formatUserName(f.user.fullName)}</td>
                  <td className="p-3 text-slate-600">{intolerancias || "—"}</td>
                  <td className="p-3 text-slate-600">
                    {new Date(f.attendedAt).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Madrid"
                    })}
                  </td>
                </tr>
              );
            })}
            {fichajesHoy.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-slate-500">
                  Aún no hay fichajes hoy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
