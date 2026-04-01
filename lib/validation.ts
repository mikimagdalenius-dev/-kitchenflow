export function parsePositiveInt(value: FormDataEntryValue | null) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function normalizeName(value: FormDataEntryValue | null, max = 80) {
  const name = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!name || name.length > max) return null;
  return name;
}

export function normalizeOptionalEmail(value: FormDataEntryValue | null) {
  const email = String(value ?? "").trim();
  if (!email) return null;
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid || email.length > 120) return null;
  return email;
}

export function parseIsoDateOnly(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, d] = raw.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
