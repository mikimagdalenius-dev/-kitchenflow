const MADRID_TZ = "Europe/Madrid";

export function monthValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function startOfMadridDay(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MADRID_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  const month = Number(parts.find((p) => p.type === "month")?.value ?? "1");
  const day = Number(parts.find((p) => p.type === "day")?.value ?? "1");

  return new Date(Date.UTC(year, month - 1, day));
}

export function parseDateInput(raw?: string | null) {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, d] = raw.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateTimeEs(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: MADRID_TZ
  }).format(date);
}

export function formatDateOnlyEs(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeZone: MADRID_TZ
  }).format(date);
}
