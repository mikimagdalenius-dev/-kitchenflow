import Link from "next/link";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccess, getSessionUser } from "@/lib/auth";
import { MENU_CATEGORY_LABEL, WEEKDAY_NAMES, WORKDAYS } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function CocinaHistoricoPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return (
      <section className="pc-card p-4">
        <p className="text-sm text-slate-700">
          Necesitas iniciar sesión para ver el histórico. <Link href="/acceso?volverA=/cocina/historico">Ir a acceso</Link>
        </p>
      </section>
    );
  }

  if (!canAccess(sessionUser.role, [Role.COOK, Role.ADMIN])) {
    return (
      <section className="pc-card p-4">
        <p className="text-sm text-slate-700">
          Necesitas iniciar sesión para ver el histórico. <Link href="/acceso?volverA=/cocina/historico">Ir a acceso</Link>
        </p>
      </section>
    );
  }

  const weeks = await prisma.menuWeek.findMany({
    orderBy: { weekStart: "desc" },
    include: {
      menuItems: {
        include: { dish: true },
        orderBy: [{ weekday: "asc" }, { category: "asc" }, { optionIndex: "asc" }]
      }
    }
  });

  return (
    <section className="page-stack">
      <div className="page-header">
        <h1 className="page-title">Histórico semanal</h1>
        <Link href="/cocina" className="pc-btn pc-btn-secondary hover:no-underline">
          Volver a cocina
        </Link>
      </div>

      {weeks.map((week) => (
        <article key={week.id} className="pc-card p-4">
          <h2 className="text-xl font-semibold text-slate-800 text-center">Semana de {new Date(week.weekStart).toLocaleDateString("es-ES")}</h2>
          <div className="mt-3 grid gap-2 text-sm text-slate-700">
            {WORKDAYS.map((day) => {
              const dayItems = week.menuItems.filter((item) => item.weekday === day);
              return (
                <div key={day} className="rounded border border-dashed border-slate-300 bg-white px-3 py-2">
                  <div className="font-semibold text-slate-800 text-center">{WEEKDAY_NAMES[day]}</div>
                  {dayItems.length === 0 ? (
                    <div className="text-slate-500">Sin menú</div>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {dayItems.map((item) => (
                        <li key={item.id}>
                          {MENU_CATEGORY_LABEL[item.category] ?? item.category}
                          {item.weekday <= 4 ? ` #${item.optionIndex}` : ""} · <strong>{item.dish.name}</strong>
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
