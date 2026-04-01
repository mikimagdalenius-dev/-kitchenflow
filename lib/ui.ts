export const WORKDAYS = [1, 2, 3, 4, 5] as const;

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
