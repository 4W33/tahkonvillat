import { getTranslations } from "next-intl/server";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import type { AmenityId } from "@/types/villa";

type Props = {
  amenities: AmenityId[];
};

export async function AmenityGrid({ amenities }: Props) {
  const t = await getTranslations("villas.detail.amenities");

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {amenities.map((amenity) => (
        <li
          key={amenity}
          className="flex items-center gap-3 rounded-sm bg-cream-50 px-4 py-4 shadow-inner ring-1 ring-forest/5 transition-all duration-200 hover:bg-cream hover:shadow-soft"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/5 text-forest"
            aria-hidden
          >
            <AmenityIcon amenity={amenity} />
          </span>
          <span className="font-sans text-base font-medium text-forest-700">
            {t(amenity)}
          </span>
        </li>
      ))}
    </ul>
  );
}
