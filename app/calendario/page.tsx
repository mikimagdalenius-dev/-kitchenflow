import { prisma } from "@/lib/prisma";
import { MENU_CATEGORY_LABEL, WEEKDAY_NAMES, sortByCategoryAndOption } from "@/lib/ui";
import { currentWeekRange, startOfMadridDay } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const { currentWeekStart, nextWeekStart } = currentWeekRange();

  const todayMadrid = startOfMadridDay(new Date());
  const utcDay = todayMadrid.getUTCDay(); // 0=Dom, 1=Lun...6=Sab
  const todayWeekday = utcDay === 0 ? 7 : utcDay; // 1=Lun...5=Vie (solo usamos 1-5)

  const currentWeek = await prisma.menuWeek
    .findFirst({
      where: { weekStart: { gte: currentWeekStart, lt: nextWeekStart } },
      orderBy: { weekStart: "desc" },
      include: {
        menuItems: {
          include: { dish: true },
          orderBy: [{ weekday: "asc" }, { category: "asc" }, { optionIndex: "asc" }]
        }
      }
    })
    .catch(() => null);

  function DayCard({ weekday }: { weekday: number }) {
    const name = WEEKDAY_NAMES[weekday];
    const isToday = weekday === todayWeekday;
    const day = sortByCategoryAndOption(currentWeek!.menuItems.filter((item) => item.weekday === weekday));

    return (
      <article className={`pc-card p-4 ${isToday ? "ring-2 ring-blue-400" : ""}`}>
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          {name}
          {isToday && (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              background: "#3b82f6",
              color: "#fff",
              borderRadius: 100,
              padding: "2px 8px",
              letterSpacing: "0.03em"
            }}>
              Hoy
            </span>
          )}
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {day.map((item) => (
            <li key={item.id} className={`rounded p-2 border ${isToday ? "border-blue-200 bg-blue-50" : "border-dashed border-slate-300 bg-white"}`}>
              <div className="font-medium text-slate-800">
                {MENU_CATEGORY_LABEL[item.category] ?? item.category}
                {item.weekday <= 4 ? ` #${item.optionIndex}` : ""} · {item.dish.name}
              </div>
              {item.dish.description?.trim() && (
                <div className="text-xs text-slate-500 mt-0.5">{item.dish.description.trim()}</div>
              )}
            </li>
          ))}
          {day.length === 0 && <li className="text-slate-500">Sin platos</li>}
        </ul>
      </article>
    );
  }

  return (
    <section className="page-stack text-center">
      <PageHeader title="Calendario semanal" subtitle="Menú semanal de servicio." />

      {!currentWeek && <EmptyState message="No hay calendario publicado aún." />}

      {currentWeek && (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 pc-stagger">
            {[1, 2, 3].map((weekday) => <DayCard key={weekday} weekday={weekday} />)}
          </div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:justify-center pc-stagger">
            {[4, 5].map((weekday) => (
              <div key={weekday} className="md:w-[calc(50%-0.375rem)] xl:w-[calc(33.333%-0.5rem)]">
                <DayCard weekday={weekday} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
