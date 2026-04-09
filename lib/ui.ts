export const WORKDAYS = [1, 2, 3, 4, 5] as const;

export const MON_THU_CATEGORIES = ["first", "second", "dessert"] as const;
export const FRIDAY_CATEGORIES = ["single", "dessert", "fruit"] as const;
export const ALLOWED_DISH_TYPES = ["first", "second", "single", "dessert"] as const;

export const WEEKDAY_NAMES: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes"
};

export const MENU_CATEGORY_LABEL: Record<string, string> = {
  first: "Primer plato",
  second: "Segundo plato",
  dessert: "Postre",
  single: "Plato único",
  fruit: "Postre"
};

export const DISH_TYPE_LABEL: Record<string, string> = {
  first: "Primer plato",
  second: "Segundo plato",
  dessert: "Postre",
  single: "Plato único"
};

export const DISH_TYPES = ["first", "second", "single", "dessert"] as const;

export function formatUserName(name: string) {
  return name.trim().toLowerCase() === "didac molto" ? `👨‍🍳 ${name}` : name;
}

export const CATEGORY_ORDER: Record<string, number> = {
  first: 1,
  second: 2,
  single: 3,
  dessert: 4,
  fruit: 4
};

export function sortByCategoryAndOption<T extends { category: string; optionIndex: number }>(items: T[]): T[] {
  return items.slice().sort((a, b) => {
    const diff = (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
    return diff !== 0 ? diff : a.optionIndex - b.optionIndex;
  });
}

export function dishMatchesCategory(dishType: string, category: string): boolean {
  if (!category) return true;
  if (category === "fruit") return dishType === "dessert";
  return dishType === category;
}
