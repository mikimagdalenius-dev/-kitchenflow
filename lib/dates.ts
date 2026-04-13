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

export function madridTimeToUtc(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  const approxUtc = new Date(Date.UTC(y, m - 1, d, h, min, 0));
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MADRID_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(approxUtc);
  const madridH = Number(parts.find((p) => p.type === "hour")?.value ?? h);
  const madridMin = Number(parts.find((p) => p.type === "minute")?.value ?? min);
  const diffMs = ((madridH * 60 + madridMin) - (h * 60 + min)) * 60 * 1000;
  return new Date(approxUtc.getTime() - diffMs);
}

export function currentWeekRange(): { currentWeekStart: Date; nextWeekStart: Date } {
  const today = startOfMadridDay(new Date());
  const dayOfWeek = today.getUTCDay(); // 0=domingo, 1=lunes...
  const dayOffsetFromMonday = (dayOfWeek + 6) % 7;
  const currentWeekStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - dayOffsetFromMonday)
  );
  const nextWeekStart = new Date(
    Date.UTC(currentWeekStart.getUTCFullYear(), currentWeekStart.getUTCMonth(), currentWeekStart.getUTCDate() + 7)
  );
  return { currentWeekStart, nextWeekStart };
}
