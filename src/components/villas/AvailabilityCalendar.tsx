"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { buildMonthCells, isBooked, shiftMonth } from "@/lib/availability/calendar-grid";
import type { Availability } from "@/types/availability";

export type CalendarView = Availability & { label: string };

type Props = {
  calendars: CalendarView[];
  locale: string;
  /** YYYY-MM-DD palvelimelta → deterministinen SSR. */
  today: string;
};

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const MAX_MONTHS_AHEAD = 12;

export function AvailabilityCalendar({ calendars, locale, today }: Props) {
  const t = useTranslations("villas.detail.calendar");
  const [active, setActive] = useState(0);
  const startYear = Number(today.slice(0, 4));
  const startMonth = Number(today.slice(5, 7)) - 1;
  const [{ year, month }, setCursor] = useState({ year: startYear, month: startMonth });

  const calendar = calendars[Math.min(active, calendars.length - 1)];
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const monthsAhead = (year - startYear) * 12 + (month - startMonth);
  const intlLocale = locale === "fi" ? "fi-FI" : "en-GB";
  const monthLabel = new Intl.DateTimeFormat(intlLocale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
  const dayFormat = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  const navButton =
    "flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--hairline)] text-xl text-ink transition-colors hover:bg-paper-100 disabled:opacity-30";

  return (
    <div>
      {calendars.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label={t("unitLabel")}>
          {calendars.map((c, index) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={index === active ? "filter-pill-active" : "filter-pill-inactive"}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Virhetilanteessa vain ilmoitus: ruudukko näyttäisi päivät vapaina. */}
      {calendar.status === "unavailable" ? (
        <p className="mb-4 rounded-lg border border-[color:var(--hairline)] bg-paper-100 px-4 py-3 font-sans text-[0.9375rem] text-forest-700">
          {t("unavailable")}
        </p>
      ) : (
        <>
          <div className="rounded-2xl border border-[color:var(--hairline)] bg-paper p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCursor(shiftMonth(year, month, -1))}
                disabled={monthsAhead <= 0}
                aria-label={t("prevMonth")}
                className={navButton}
              >
                ‹
              </button>
              <p
                className="font-display text-2xl font-semibold capitalize text-ink"
                aria-live="polite"
              >
                {monthLabel}
              </p>
              <button
                type="button"
                onClick={() => setCursor(shiftMonth(year, month, 1))}
                disabled={monthsAhead >= MAX_MONTHS_AHEAD}
                aria-label={t("nextMonth")}
                className={navButton}
              >
                ›
              </button>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_KEYS.map((key) => (
                <div key={key} className="mono-label py-1 text-[0.9375rem]">
                  {t(`weekdays.${key}`)}
                </div>
              ))}
              {cells.map((cell) => {
                const booked = cell.inMonth && isBooked(cell.iso, calendar.booked);
                const past = cell.iso < today;
                const label = dayFormat.format(new Date(`${cell.iso}T00:00:00Z`));
                return (
                  <div
                    key={cell.iso}
                    role={cell.inMonth ? "img" : undefined}
                    aria-label={
                      cell.inMonth
                        ? booked
                          ? t("bookedDay", { date: label })
                          : t("freeDay", { date: label })
                        : undefined
                    }
                    aria-hidden={!cell.inMonth}
                    className={[
                      "flex aspect-square min-h-10 items-center justify-center rounded-md font-sans text-[0.9375rem]",
                      !cell.inMonth ? "invisible" : "",
                      booked
                        ? "bg-paper-300 text-forest-500 line-through decoration-forest-400"
                        : "bg-paper-50 text-ink",
                      past && cell.inMonth ? "opacity-40" : "",
                    ].join(" ")}
                  >
                    {cell.day}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5 font-sans text-[0.9375rem] text-forest-600">
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-sm border border-[color:var(--hairline)] bg-paper-50"
                  aria-hidden
                />
                {t("legendFree")}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-sm bg-paper-300" aria-hidden />
                {t("legendBooked")}
              </span>
            </div>
          </div>

          <p className="mt-3 font-sans text-[0.9375rem] text-forest-600">{t("syncHint")}</p>
        </>
      )}
    </div>
  );
}
