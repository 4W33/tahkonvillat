"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type BookedRange = {
  startDate: string;
  endDate: string;
};

type Props = {
  bookedRanges: BookedRange[];
};

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isBooked(date: Date, ranges: BookedRange[]): boolean {
  const day = toDateString(date);
  return ranges.some((r) => day >= r.startDate && day < r.endDate);
}

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function AvailabilityCalendar({ bookedRanges }: Props) {
  const t = useTranslations("villas.detail.calendar");
  const [view, setView] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { days, monthLabel } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

    const cells: Array<{ date: Date | null; booked: boolean; past: boolean }> =
      [];

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      if (dayNum < 1 || dayNum > lastDay.getDate()) {
        cells.push({ date: null, booked: false, past: false });
        continue;
      }

      const date = new Date(year, month, dayNum);
      const past = date < todayStart;
      cells.push({
        date,
        booked: isBooked(date, bookedRanges),
        past,
      });
    }

    const label = view.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });

    return { days: cells, monthLabel: label };
  }, [view, bookedRanges]);

  function shiftMonth(delta: number) {
    setView((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl text-forest">{t("title")}</h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-forest transition-colors hover:bg-forest/5"
            aria-label={t("prevMonth")}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-forest transition-colors hover:bg-forest/5"
            aria-label={t("nextMonth")}
          >
            ›
          </button>
        </div>
      </div>

      <p className="mt-1 font-sans text-sm capitalize text-forest-600">
        {monthLabel}
      </p>
      <p className="mt-2 font-sans text-xs text-forest-500">{t("hint")}</p>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-forest-500"
          >
            {t(`weekdays.${day}`)}
          </div>
        ))}

        {days.map((cell, index) => {
          if (!cell.date) {
            return <div key={`empty-${index}`} />;
          }

          const { date, booked, past } = cell;
          const available = !booked && !past;

          return (
            <div
              key={toDateString(date)}
              className={`flex h-9 items-center justify-center rounded-sm font-sans text-xs ${
                booked
                  ? "bg-forest/15 font-semibold text-forest-400 line-through"
                  : past
                    ? "text-forest-300"
                    : available
                      ? "bg-forest/5 font-medium text-forest"
                      : "text-forest-400"
              }`}
              aria-label={
                booked
                  ? t("bookedDay", { date: date.getDate() })
                  : t("freeDay", { date: date.getDate() })
              }
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 font-sans text-xs text-forest-600">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-forest/5 ring-1 ring-forest/10" />
          {t("legendFree")}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-forest/15" />
          {t("legendBooked")}
        </span>
      </div>
    </div>
  );
}
