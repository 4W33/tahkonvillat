/**
 * Syvämerge: kävelee templaten (messages/fi.json-rakenne) ja poimii tallennetusta
 * ylikirjoituksesta arvon vain, jos sen tyyppi täsmää. Templaten ulkopuoliset
 * avaimet pudotetaan. Näin uudet avaimet toimivat heti ja admin-tallennus
 * läpäisee validate-site-messages-tarkistuksen.
 */
export function mergeMessages<T>(template: T, stored: unknown): T {
  if (typeof template === "string") {
    return (typeof stored === "string" ? stored : template) as T;
  }

  if (Array.isArray(template)) {
    const ok =
      Array.isArray(stored) && stored.every((item) => typeof item === "string");
    return (ok ? stored : template) as T;
  }

  if (template && typeof template === "object") {
    const source =
      stored && typeof stored === "object" && !Array.isArray(stored)
        ? (stored as Record<string, unknown>)
        : {};
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(template as Record<string, unknown>)) {
      out[key] = mergeMessages(
        (template as Record<string, unknown>)[key],
        source[key],
      );
    }
    return out as T;
  }

  return template;
}
