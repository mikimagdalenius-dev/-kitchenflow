import Link from "next/link";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccess, getSessionUser } from "@/lib/auth";
import { createDishAction, createWeekAction, deleteMenuItemAction } from "./actions";
import { AddMenuForm } from "./add-menu-form";
import { DISH_TYPE_LABEL, DISH_TYPES, MENU_CATEGORY_LABEL, WEEKDAY_NAMES, WORKDAYS } from "@/lib/ui";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function CocinaPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return (
      <section className="pc-card p-4">
        <p className="text-sm text-slate-700">
          Necesitas iniciar sesión para usar Cocina. <Link href="/acceso?volverA=/cocina">Ir a acceso</Link>
        </p>
      </section>
    );
  }

  const puedeEditar = canAccess(sessionUser.role, [Role.COOK, Role.ADMIN]);

  const now = new Date();
  const dayOffsetFromMonday = (now.getUTCDay() + 6) % 7;
  const currentWeekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffsetFromMonday)
  );
  const nextWeekStart = new Date(
    Date.UTC(
      currentWeekStart.getUTCFullYear(),
      currentWeekStart.getUTCMonth(),
      currentWeekStart.getUTCDate() + 7
    )
  );

  const excelPlatosUrl = process.env.NEXT_PUBLIC_DISHES_EXCEL_URL?.trim();

  const [weeks, dishes] = await Promise.all([
    prisma.menuWeek
      .findMany({
        where: {
          weekStart: {
            gte: currentWeekStart,
            lt: nextWeekStart
          }
        },
        orderBy: { weekStart: "desc" },
        include: {
          menuItems: {
            include: { dish: true },
            orderBy: [{ weekday: "asc" }, { category: "asc" }, { optionIndex: "asc" }]
          }
        }
      })
      .catch(() => []),
    prisma.dish.findMany({ orderBy: { name: "asc" }, take: 150 }).catch(() => [])
  ]);

  return (
    <section className="page-stack">
      <PageHeader title="Cocina" subtitle="Gestión semanal de platos y menús." />

      {puedeEditar && (
        <div className="grid gap-3 md:grid-cols-3 text-center">
          <form action={createWeekAction} className="pc-card p-4 space-y-2">
            <h2 className="font-semibold text-slate-800">Nueva semana</h2>
            <input name="weekStart" type="date" className="pc-select" required />
            <div className="flex justify-center">
              <FormSubmitButton idleText="Crear semana" pendingText="Creando semana..." />
            </div>
          </form>

          <form action={createDishAction} className="pc-card p-4 space-y-2">
            <h2 className="font-semibold text-slate-800">Nuevo plato</h2>
            <input name="name" placeholder="Nombre" className="pc-select" required />
            <select name="dishType" className="pc-select" defaultValue="" required>
              <option value="">Tipo de plato...</option>
              {DISH_TYPES.map((dishType) => (
                <option key={dishType} value={dishType}>
                  {DISH_TYPE_LABEL[dishType] ?? dishType}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500">Nombre del plato y tipo</div>
            <div className="flex justify-center">
              <FormSubmitButton idleText="Guardar plato" pendingText="Guardando plato..." />
            </div>

            <div className="pt-1 flex flex-col items-center justify-center gap-1 text-xs">
              {excelPlatosUrl && (
                <Link
                  href={excelPlatosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  Ir al Excel
                </Link>
              )}
            </div>
          </form>

          <AddMenuForm
            weeks={weeks.map((w) => ({ id: w.id, weekStart: w.weekStart.toISOString() }))}
            dishes={dishes.map((d) => ({ id: d.id, name: d.name, dishType: d.dishType }))}
          />
        </div>
      )}

      {puedeEditar && (
        <div className="flex items-center justify-end">
          <Link href="/cocina/historico" className="pc-btn pc-btn-secondary hover:no-underline">
            Histórico semanal
          </Link>
        </div>
      )}

      {weeks.length === 0 && <EmptyState message="Aún no hay semanas cargadas." />}

      {weeks.map((week) => (
        <article key={week.id} className="pc-card p-4">
          <h2 className="text-xl font-semibold text-slate-800 text-center">
            Semana del {new Date(week.weekStart).toLocaleDateString("es-ES")} al {new Date(new Date(week.weekStart).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES")}
          </h2>

          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            {WORKDAYS.map((day) => {
              const categoryOrder: Record<string, number> = {
                first: 1,
                second: 2,
                dessert: 3,
                fruit: 3,
                single: 4
              };

              const dayItems = week.menuItems
                .filter((item) => item.weekday === day)
                .slice()
                .sort((a, b) => {
                  const categoryDiff = (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99);
                  if (categoryDiff !== 0) return categoryDiff;
                  return a.optionIndex - b.optionIndex;
                });

              return (
                <div key={day} className="rounded border border-dashed border-slate-300 bg-white px-3 py-2">
                  <div className="font-semibold text-slate-800 text-center">{WEEKDAY_NAMES[day]}</div>
                  {dayItems.length === 0 ? (
                    <div className="text-slate-500">Sin menú</div>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {dayItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2">
                          <span>
                            {MENU_CATEGORY_LABEL[item.category] ?? item.category}
                            {item.weekday <= 4 ? ` #${item.optionIndex}` : ""} · <strong>{item.dish.name}</strong>
                          </span>
                          {puedeEditar && (
                            <form action={deleteMenuItemAction}>
                              <input type="hidden" name="menuItemId" value={item.id} />
                              <ConfirmSubmitButton
                                buttonText="Borrar"
                                className="pc-btn pc-btn-secondary"
                                firstConfirmText="¿Seguro que quieres borrar este plato del menú?"
                                secondPromptText="Escribe BORRAR para confirmar"
                                requiredWord="BORRAR"
                              />
                            </form>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </section>
  );
}
