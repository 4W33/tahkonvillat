export type GuestReview = {
  comment: string;
  author?: string;
  rating?: number;
  date?: string;
};

const JUNK_PATTERNS = [
  /näytä kaikki/i,
  /näytä lisää/i,
  /^tallenna$/i,
  /valokuvat/i,
  /mukavuudet/i,
  /majoitushinta sisältää/i,
  /^pääsy yksityiselle/i,
  /^kohteen tarjoamat/i,
  /muuntyyppiset majoitukset/i,
  /lomamajoitukset.*paikassa/i,
  /vuokrattavat loma/i,
  /^tukiapukeskus/i,
  /^liikkuminen\d+sijainti/i,
  /^keittiöilmainen pysäköinti/i,
  /^pääsy yksityiselle rannallekeittiö/i,
  /lentokenttä\/flamingo luxury/i,
  /^ylellinen 2 makuuhuonetta/i,
  /^flamingo\/airport luxury/i,
  /^villa puolukka.*hissilippua/i,
  /mainittu vieraiden antamissa arvosteluissa/i,
  /pyydä apua turvallisuusongelmassa/i,
  /sijoittajatairbnb/i,
  /vuokraamaan.*sovelluksesta/i,
];

const LISTING_TITLE_PATTERNS = [
  /^villa /i,
  /^tahkon /i,
  /^lentokenttä\//i,
  /^flamingo\//i,
  /^ylellinen \d/i,
];

const MONTHS =
  /(tammikuu|helmikuu|maaliskuu|huhtikuu|toukokuu|kesäkuu|heinäkuu|elokuu|syyskuu|lokakuu|marraskuu|joulukuu)\s+\d{4}/i;

function isJunk(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length < 30) return true;
  if (/^Arvio, \d+ tähteä/i.test(normalized) && normalized.length < 90) return true;
  if (/majoittuminen\s*$/i.test(normalized)) return true;
  if (JUNK_PATTERNS.some((p) => p.test(normalized))) return true;
  if (LISTING_TITLE_PATTERNS.some((p) => p.test(normalized))) return true;
  if (
    /^[^.!?]{0,120}$/.test(normalized) &&
    /(wifi|pesukone|sauna|poreallas|keittiö){3,}/i.test(normalized)
  ) {
    return true;
  }
  return false;
}

function extractRating(text: string): number | undefined {
  const match = text.match(/(?:Arvio,?\s*)?(\d+)\s*tähteä/i);
  return match ? Number(match[1]) : undefined;
}

function extractDate(text: string): string | undefined {
  const match = text.match(MONTHS);
  return match ? match[0] : undefined;
}

function hasPlatformMention(text: string): boolean {
  return /\bairbnb\b/i.test(text) || /vuokraamaan.*sovelluksesta/i.test(text);
}

function parseSingleReview(
  text: string,
  fallback: Partial<GuestReview> = {},
): GuestReview | null {
  const normalized = text.replace(/Näytä lisää/gi, "").replace(/\s+/g, " ").trim();
  if (normalized.length < 30) return null;
  if (/^Arvio, \d+ tähteä/i.test(normalized) && normalized.length < 90) return null;

  let author = fallback.author;
  const authorMatch = normalized.match(
    /^([A-ZÄÖÅ][a-zäöå]+)(?:Suomi|\d+ vuotta Airbnb)/,
  );
  if (authorMatch) author = authorMatch[1];

  const rating = fallback.rating ?? extractRating(normalized);
  const date = fallback.date ?? extractDate(normalized);
  let comment = normalized;

  const afterStay = normalized.match(/majoittuminen\s+(.+)$/i);
  if (afterStay) {
    comment = afterStay[1].trim();
  } else if (/Arvio, \d+ tähteä/.test(normalized)) {
    const stripped = normalized
      .replace(/^[^A-ZÄÖÅ]*/, "")
      .replace(/^[A-ZÄÖÅ][a-zäöå]+(?:Suomi|\d+ vuotta Airbnb:llä)?/i, "")
      .replace(/Arvio, \d+ tähteä,?\s*/i, "")
      .replace(/·\s*[^·]+·\s*/g, "")
      .replace(/Muutaman yön majoittuminen\s*/i, "")
      .replace(/Yhden yön majoittuminen\s*/i, "")
      .trim();
    if (stripped.length >= 30) comment = stripped;
  }

  comment = comment
    .replace(/[A-ZÄÖÅ][a-zäöå]+(?:Suomi|\d+ vuotta Airbnb:llä).*$/, "")
    .replace(/^(?:Muutaman yön|Yhden yön)\s+majoittuminen\s*/i, "")
    .replace(/^,\s*\d+\s*tähteä,?\s*/i, "")
    .replace(/^\d+\s*(?:vuotta|kuukautta|viikkoa)\s*Airbnb:llä\s*/i, "")
    .replace(/^[,\s·]+/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (comment.length < 30 || isJunk(comment) || hasPlatformMention(comment)) {
    return null;
  }

  return { comment, author, rating, date };
}

function splitReviewBlock(
  text: string,
  fallback: Partial<GuestReview> = {},
): GuestReview[] {
  const normalized = text.replace(/Näytä lisää/gi, "").replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const parts = normalized.split(
    /(?=[A-ZÄÖÅ][a-zäöå]+(?:Suomi|\d+ vuotta Airbnb:llä))/,
  );

  if (parts.length <= 1) {
    const single = parseSingleReview(normalized, fallback);
    return single ? [single] : [];
  }

  const parsed: GuestReview[] = [];
  for (const part of parts) {
    const review = parseSingleReview(part, fallback);
    if (review) parsed.push(review);
  }
  return parsed;
}

export function cleanReviews(
  raw: Array<{
    comment?: string;
    author?: string;
    rating?: number | null;
    date?: string;
  }>,
  max = 10,
): GuestReview[] {
  const seen = new Set<string>();
  const cleaned: GuestReview[] = [];

  for (const item of raw) {
    const fallback: Partial<GuestReview> = {
      author: item.author?.trim() || undefined,
      rating: typeof item.rating === "number" ? item.rating : undefined,
      date: item.date || undefined,
    };

    const blocks = splitReviewBlock(item.comment || "", fallback);

    for (const review of blocks) {
      const key = review.comment.slice(0, 100).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push(review);
    }
  }

  const sorted = cleaned.sort((a, b) => b.comment.length - a.comment.length);
  const deduped: GuestReview[] = [];

  for (const review of sorted) {
    const duplicate = deduped.some(
      (existing) =>
        existing.comment.includes(review.comment) ||
        review.comment.includes(existing.comment),
    );
    if (!duplicate) deduped.push(review);
  }

  return deduped.slice(0, max);
}
