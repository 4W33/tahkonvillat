const FI_MONTHS = [
  "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
  "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu",
];

/** Airbnb-datan päiväys on suomeksi ("helmikuu 2024"); muilla kielillä se muotoillaan uudelleen. */
export function formatReviewDate(date: string, locale: string): string {
  if (locale === "fi") return date;
  const match = date.trim().toLowerCase().match(/^(\S+)\s+(\d{4})$/);
  const month = match ? FI_MONTHS.indexOf(match[1]) : -1;
  if (!match || month < 0) return date;
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(Number(match[2]), month, 1)),
  );
}
