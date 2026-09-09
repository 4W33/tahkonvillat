import type { BookedRange } from "@/types/availability";

export type DayCell = { iso: string; day: number; inMonth: boolean };

/** 6 riviä × 7 päivää, viikko alkaa maanantaista. month0 = 0–11. Kaikki UTC:ssä → ei DST-heittoja. */
export function buildMonthCells(year: number, month0: number): DayCell[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const lead = (first.getUTCDay() + 6) % 7; // ma=0 … su=6
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(Date.UTC(year, month0, 1 + (i - lead)));
    cells.push({
      iso: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month0,
    });
  }
  return cells;
}

export function isBooked(day: string, ranges: BookedRange[]): boolean {
  return ranges.some((r) => day >= r.start && day < r.end);
}

export function shiftMonth(
  year: number,
  month0: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month0 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}
