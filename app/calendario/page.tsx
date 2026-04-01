import { prisma } from "@/lib/prisma";
import { MENU_CATEGORY_LABEL } from "@/lib/ui";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

const weekdayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const categoryOrder: Record<string, number> = {
  first: 1,
  second: 2,
  single: 3,
  dessert: 4,
  fruit: 4
};

function sortByCategoryAndOption<T extends { category: string; optionIndex: number }>(items: T[]) {
  return items
    .slice()
    .sort((a, b) => {
      const categoryDiff = (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99);
      if (categoryDiff !== 0) return categoryDiff;
      return a.optionIndex - b.optionIndex;
    });
}

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const now = new Date();
  const dayOffsetFromMonday = (now.getUTCDay() + 6) % 7;
  const currentWeekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffsetFromMonday)
  );
  const nextWeekStart = new Date(
    Date.UTC(currentWeekStart.getUTCFullYear(), currentWeekStart.getUTCMonth(), currentWeekStart.getUTCDate() + 7)
  );

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
            {weekdayNames.slice(0, 3).map((name, index) => {
              const day = sortByCategoryAndOption(
                currentWeek.menuItems.filter((item) => item.weekday === index + 1)
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
            {weekdayNames.slice(3).map((name, offset) => {
              const day = sortByCategoryAndOption(
                currentWeek.menuItems.filter((item) => item.weekday === offset + 4)
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
