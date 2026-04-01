"use client";

import { useMemo, useState } from "react";
import { WEEKDAY_NAMES, WORKDAYS } from "@/lib/ui";
import { assignMenuItemAction } from "./actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type WeekItem = { id: number; weekStart: string };
type DishItem = { id: number; name: string; dishType: string };

function dishMatchesCategory(dishType: string, category: string) {
  if (!category) return true;
  if (category === "fruit") return dishType === "dessert";
  return dishType === category;
}

export function AddMenuForm({ weeks, dishes }: { weeks: WeekItem[]; dishes: DishItem[] }) {
  const [dishQuery, setDishQuery] = useState("");
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [category, setCategory] = useState("");

  const dishesByCategory = useMemo(
    () =>
      dishes
        .filter((d) => dishMatchesCategory(d.dishType, category))
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" })),
    [dishes, category]
  );

  const filtered = useMemo(() => {
    const q = dishQuery.trim().toLowerCase();
    if (!q) return dishesByCategory.slice(0, 12);
    return dishesByCategory.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 12);
  }, [dishesByCategory, dishQuery]);

  const onDishChange = (value: string) => {
    setDishQuery(value);
    const exact = dishesByCategory.find((d) => d.name.toLowerCase() === value.trim().toLowerCase()) ?? null;
    setSelectedDishId(exact?.id ?? null);
  };

  return (
    <form action={assignMenuItemAction} className="pc-card p-4 space-y-2 text-center">
      <h2 className="font-semibold text-slate-800">Añadir al menú</h2>

      <select name="menuWeekId" className="pc-select" required defaultValue={weeks[0]?.id ?? ""}>
        <option value="">Semana...</option>
        {weeks.map((week) => {
          const monday = new Date(week.weekStart);
          const friday = new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
          return (
            <option key={week.id} value={week.id}>
              {`${monday.toLocaleDateString("es-ES")} - ${friday.toLocaleDateString("es-ES")}`}
            </option>
          );
        })}
      </select>

      <select name="weekday" className="pc-select" required>
        <option value="">Día...</option>
        {WORKDAYS.map((day) => (
          <option key={day} value={day}>
            {WEEKDAY_NAMES[day]}
          </option>
        ))}
      </select>

      <select
        name="category"
        className="pc-select"
        required
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setDishQuery("");
          setSelectedDishId(null);
        }}
      >
        <option value="">Categoría...</option>
        <option value="first">Primer plato</option>
        <option value="second">Segundo plato</option>
        <option value="single">Plato único</option>
        <option value="dessert">Postre</option>
      </select>

      <input
        className="pc-select"
        placeholder="Plato (escribe para buscar)"
        list="platos-lista"
        value={dishQuery}
        onChange={(e) => onDishChange(e.target.value)}
      />
      <datalist id="platos-lista">
        {dishesByCategory.map((dish) => (
          <option key={dish.id} value={dish.name} />
        ))}
      </datalist>

      <input
        type="number"
        name="dishId"
        value={selectedDishId ?? ""}
        readOnly
        required
        tabIndex={-1}
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0 pointer-events-none"
      />

      {!selectedDishId && dishQuery.trim().length > 0 && filtered.length > 0 && (
        <div className="acceso-suggestions">
          {filtered.map((dish) => (
            <button
              key={dish.id}
              type="button"
              className="acceso-suggestion"
              onClick={() => {
                setDishQuery(dish.name);
                setSelectedDishId(dish.id);
              }}
            >
              {dish.name}
            </button>
          ))}
        </div>
      )}

      <input name="description" className="pc-select" placeholder="Descripción / cambios de preparación (opcional)" />

      <div className="flex justify-center">
        <FormSubmitButton idleText="Añadir opción" pendingText="Añadiendo..." />
      </div>
    </form>
  );
}
