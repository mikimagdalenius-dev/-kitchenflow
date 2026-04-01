export function pointsFromDemon(position: number): number {
  const clamped = Math.min(75, Math.max(1, position));
  const start = 350;
  const end = 30;
  const steps = 74;
  const value = start - ((clamped - 1) * (start - end)) / steps;
  return Math.round(value);
}
