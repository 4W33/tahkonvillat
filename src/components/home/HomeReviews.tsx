import { getLocale, getTranslations } from "next-intl/server";
import { getVillas } from "@/lib/content/villas";
import { getApartments } from "@/lib/content/apartments";
import { Reveal } from "@/components/ui/Reveal";
import { StarRating } from "@/components/reviews/StarRating";
import type { GuestReview } from "@/types/review";

type Card = {
  comment: string;
  author?: string;
  rating?: number;
  property: string;
};

function bestReviews(reviews: GuestReview[] | undefined): GuestReview[] {
  return (reviews ?? [])
    .filter((r) => {
      const len = r.comment?.trim().length ?? 0;
      return len >= 50 && len <= 240;
    })
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

export async function HomeReviews() {
  const t = await getTranslations("home.homeReviews");
  const lang = (await getLocale()) as "fi" | "en";
  const villas = await getVillas();
  const apartments = await getApartments();
  const properties = [...villas, ...apartments];

  // One standout review per property first (variety), then fill from seconds.
  const firsts: Card[] = [];
  const seconds: Card[] = [];
  for (const p of properties) {
    const name = (p.name as { fi: string; en: string })?.[lang] ?? "";
    const sorted = bestReviews(p.reviews);
    if (sorted[0])
      firsts.push({
        comment: sorted[0].comment.trim(),
        author: sorted[0].author,
        rating: sorted[0].rating,
        property: name,
      });
    if (sorted[1])
      seconds.push({
        comment: sorted[1].comment.trim(),
        author: sorted[1].author,
        rating: sorted[1].rating,
        property: name,
      });
  }
  const cards = [...firsts, ...seconds].slice(0, 6);

  if (cards.length === 0) return null;

  return (
    <section className="bg-[#F7F2EA] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h2 className="section-title mt-2">{t("title")}</h2>
            <p className="mt-5 font-sans text-base leading-relaxed text-forest-700">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <Reveal key={`${card.property}-${index}`} delay={(index % 3) * 90}>
              <figure className="quote-card h-full">
                {card.rating != null && (
                  <StarRating value={card.rating} size="sm" />
                )}
                <blockquote className="mt-4 flex-1 font-serif text-lg italic leading-snug text-ink">
                  {card.comment}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-2 font-sans text-[0.82rem] text-forest-600">
                  {card.author && <span className="font-semibold text-ink">{card.author}</span>}
                  {card.author && <span aria-hidden>·</span>}
                  <span>{card.property}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
