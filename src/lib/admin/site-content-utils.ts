export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export function setByPath(
  root: JsonObject,
  path: string,
  value: string,
): JsonObject {
  const keys = path.split(".");
  const next = structuredClone(root) as JsonObject;
  let cursor: JsonObject = next;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const child = cursor[key];
    if (!child || typeof child !== "object" || Array.isArray(child)) {
      cursor[key] = {};
    }
    cursor = cursor[key] as JsonObject;
  }

  cursor[keys[keys.length - 1]] = value;
  return next;
}

export function collectStringFields(
  value: JsonValue,
  basePath = "",
): { path: string; value: string }[] {
  if (typeof value === "string") {
    return basePath ? [{ path: basePath, value }] : [];
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    collectStringFields(child, basePath ? `${basePath}.${key}` : key),
  );
}

export function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const SECTION_LABELS: Record<string, string> = {
  metadata: "SEO & sivuston otsikko",
  common: "Brändi & yleiset",
  nav: "Navigaatio",
  footer: "Alatunniste",
  home: "Etusivu",
  villas: "Villat-sivu",
  apartments: "Asunnot-sivu",
  contact: "Yhteystiedot",
  faq: "UKK",
  checkout: "Lähtöpäivän ohjeet",
  pricing: "Hinnoittelutekstit",
  reviews: "Arvostelut",
  privacy: "Tietosuoja",
  notFound: "404-sivu",
};

export const SECTION_PREVIEW: Record<string, string> = {
  home: "/",
  villas: "/villat",
  apartments: "/asunnot",
  contact: "/yhteystiedot",
  faq: "/faq",
  checkout: "/lahtopaivan-ohjeet",
  privacy: "/tietosuoja",
};
