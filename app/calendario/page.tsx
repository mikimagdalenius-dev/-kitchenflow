import { prisma } from "@/lib/prisma";
import { MENU_CATEGORY_LABEL, WEEKDAY_NAMES, sortByCategoryAndOption } from "@/lib/ui";
import { currentWeekRange } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const { currentWeekStart, nextWeekStart } = currentWeekRange();

  const currentWeek = await prisma.menuWeek
    .findFirst({
      where: {
        weekStart: {
          gte: currentWeekStart,
          lt: nextWeekStart
        }
      },
      orderBy: { weekStart: "desc" },
      include: {
        menuItems: {
          include: {
            dish: true
          },
          orderBy: [{ weekday: "asc" }, { category: "asc" }, { optionIndex: "asc" }]
        }
      }
    })
    .catch(() => null);

  return (
    <section className="page-stack text-center">
      <PageHeader title="Calendario semanal" subtitle="Menú semanal de servicio." />

      {!currentWeek && <EmptyState message="No hay calendario publicado aún." />}

      {currentWeek && (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((weekday) => {
              const name = WEEKDAY_NAMES[weekday];
              const day = sortByCategoryAndOption(
                currentWeek.menuItems.filter((item) => item.weekday === weekday)
              );
              return (
                <article key={name} className="pc-card p-4">
                  <h2 className="text-lg font-semibold text-slate-800">{name}</h2>
                  <ul className="mt-2 space-y-2 text-sm">
                    {day.map((item) => (
                      <li key={item.id} className="rounded bg-white p-2 border border-dashed border-slate-300">
                        <div className="font-medium text-slate-800">
                          {MENU_CATEGORY_LABEL[item.category] ?? item.category}
                          {item.weekday <= 4 ? ` #${item.optionIndex}` : ""} · {item.dish.name}
                        </div>
                        <div className="text-xs text-slate-600">
                          Descripción: {item.dish.description?.trim() || "sin descripción"}
                        </div>
                      </li>
                    ))}
                    {day.length === 0 && <li className="text-slate-500">Sin platos</li>}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:justify-center">
            {[4, 5].map((weekday) => {
              const name = WEEKDAY_NAMES[weekday];
              const day = sortByCategoryAndOption(
                currentWeek.menuItems.filter((item) => item.weekday === weekday)
              );
              return (
                <article key={name} className="pc-card p-4 md:w-[calc(50%-0.375rem)] xl:w-[calc(33.333%-0.5rem)]">
                  <h2 className="text-lg font-semibold text-slate-800">{name}</h2>
                  <ul className="mt-2 space-y-2 text-sm">
                    {day.map((item) => (
                      <li key={item.id} className="rounded bg-white p-2 border border-dashed border-slate-300">
                        <div className="font-medium text-slate-800">
                          {MENU_CATEGORY_LABEL[item.category] ?? item.category}
                          {item.weekday <= 4 ? ` #${item.optionIndex}` : ""} · {item.dish.name}
                        </div>
                        <div className="text-xs text-slate-600">
                          Descripción: {item.dish.description?.trim() || "sin descripción"}
                        </div>
                      </li>
                    ))}
                    {day.length === 0 && <li className="text-slate-500">Sin platos</li>}
                  </ul>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
