export function formatImageAlt(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const letters = trimmed.replace(/[^a-zA-ZäöåÄÖÅ]/g, "");
  if (letters.length > 0 && letters === letters.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .replace(/(^|[\s/(-])(\S)/g, (_, prefix: string, char: string) => {
        return `${prefix}${char.toUpperCase()}`;
      });
  }

  return trimmed;
}
