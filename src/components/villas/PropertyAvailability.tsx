import { getTranslations } from "next-intl/server";
import { getAvailability } from "@/lib/availability/availability";
import { listCalendarKeys } from "@/lib/availability/keys";
import type { Villa } from "@/types/villa";
import { AvailabilityCalendar, type CalendarView } from "./AvailabilityCalendar";

type Props = { villa: Villa; locale: "fi" | "en" };

/** Saatavuus-osio villasivulle. Ei renderöidy, jos mitään näytettävää ei ole. */
export async function PropertyAvailability({ villa, locale }: Props) {
  const keys = listCalendarKeys([villa]);
  const availabilities = await Promise.all(keys.map((k) => getAvailability(k.key)));
  const calendars: CalendarView[] = availabilities.map((a, i) => ({
    ...a,
    label: keys[i].label[locale],
  }));

  const nothingToShow = calendars.every(
    (c) => c.status === "unconfigured" && c.booked.length === 0,
  );
  if (nothingToShow) return null;

  const t = await getTranslations({ locale, namespace: "villas.detail.calendar" });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section
      className="mt-12"
      aria-labelledby="availability-title"
    >
      <h2
        id="availability-title"
        className="font-display text-4xl font-semibold text-forest sm:text-5xl"
      >
        {t("title")}
      </h2>
      <div className="mt-6">
        <AvailabilityCalendar calendars={calendars} locale={locale} today={today} />
      </div>
    </section>
  );
}
