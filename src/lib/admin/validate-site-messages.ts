import type { SiteMessages } from "@/lib/data/site-messages-store";
import fiTemplate from "../../../messages/fi.json";

function validateShape(
  template: unknown,
  candidate: unknown,
  path: string,
): string | null {
  if (typeof template === "string") {
    if (typeof candidate !== "string") {
      return `${path}: odotettiin tekstiä`;
    }
    return null;
  }

  if (!template || typeof template !== "object" || Array.isArray(template)) {
    return `${path}: virheellinen malli`;
  }

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return `${path}: odotettiin objektia`;
  }

  const templateObj = template as Record<string, unknown>;
  const candidateObj = candidate as Record<string, unknown>;

  for (const key of Object.keys(templateObj)) {
    const nextPath = path ? `${path}.${key}` : key;
    const error = validateShape(templateObj[key], candidateObj[key], nextPath);
    if (error) return error;
  }

  for (const key of Object.keys(candidateObj)) {
    if (!(key in templateObj)) {
      return `${path ? `${path}.` : ""}${key}: tuntematon kenttä`;
    }
  }

  return null;
}

export function validateSiteMessages(messages: unknown): messages is SiteMessages {
  if (!messages || typeof messages !== "object" || Array.isArray(messages)) {
    return false;
  }

  return validateShape(fiTemplate, messages, "") === null;
}

export function getSiteMessagesValidationError(messages: unknown): string | null {
  if (!messages || typeof messages !== "object" || Array.isArray(messages)) {
    return "Virheellinen JSON-rakenne";
  }

  return validateShape(fiTemplate, messages, "");
}
