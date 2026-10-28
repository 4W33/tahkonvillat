import type { Field } from "payload";

const META_KEYS = new Set(["id", "createdAt", "updatedAt", "globalType"]);

/**
 * Payload (db-postgres) kokoaa globalin kaikki lokalisoidut sarakkeet yhteen
 * json_build_array-kutsuun, jolla Postgresissa on 100 argumentin raja.
 */
export const MAX_LOCALIZED_PER_GLOBAL = 90;

export function countLocalized(template: Record<string, unknown>): number {
  return Object.entries(template).reduce((n, [key, value]) => {
    if (key === "image" || Array.isArray(value)) return n;
    if (value && typeof value === "object") return n + countLocalized(value as Record<string, unknown>);
    return n + 1;
  }, 0);
}

/**
 * messages/fi.json-rakenne → Payload-kentät. Uusi käännösavain ilmestyy
 * adminiin automaattisesti. Label = avain sellaisenaan (ei keksittyä suomennosta).
 */
export function messagesToFields(template: Record<string, unknown>): Field[] {
  return Object.entries(template).map(([name, value]): Field => {
    if (name === "image") return { type: "upload", name, relationTo: "media" };
    if (Array.isArray(value)) {
      return {
        type: "array",
        name,
        localized: true,
        fields: [{ name: "value", type: "textarea", required: true }],
      };
    }
    if (value && typeof value === "object") {
      return { type: "group", name, fields: messagesToFields(value as Record<string, unknown>) };
    }
    return typeof value === "string" && value.length > 80
      ? { type: "textarea", name, localized: true }
      : { type: "text", name, localized: true };
  });
}

/**
 * Globalin dokumentti (yksi kieli) → viestipuu. Tyhjät arvot jäävät pois,
 * jolloin mergeMessages käyttää oletusta.
 */
export function globalToMessages(doc: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!doc || typeof doc !== "object") return out;
  for (const [key, value] of Object.entries(doc as Record<string, unknown>)) {
    if (META_KEYS.has(key)) continue;
    if (key === "image") {
      const url = (value as { url?: unknown } | null)?.url;
      if (typeof url === "string" && url) out[key] = url;
    } else if (Array.isArray(value)) {
      const items = value
        .map((row) => (row as { value?: unknown })?.value)
        .filter((v): v is string => typeof v === "string" && v !== "");
      if (items.length) out[key] = items;
    } else if (value && typeof value === "object") {
      const nested = globalToMessages(value);
      if (Object.keys(nested).length) out[key] = nested;
    } else if (typeof value === "string" && value !== "") {
      out[key] = value;
    }
  }
  return out;
}
