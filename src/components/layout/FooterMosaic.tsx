"use client";

import Image from "next/image";
import { usePathname } from "@/i18n/navigation";

const mosaicImages = [
  { src: "/images/properties/villa-karpalo/02.jpg", alt: "Villa Karpalo sisätilat" },
  { src: "/images/properties/villa-puolukka/05.jpg", alt: "Villa Puolukka" },
  { src: "/images/properties/villa-karpalo/08.jpg", alt: "Villa Karpalo sauna" },
  { src: "/images/properties/villa-puolukka/11.jpg", alt: "Villa Puolukka terassi" },
  { src: "/images/properties/villa-karpalo/14.jpg", alt: "Villa Karpalo maisema" },
];

export function FooterMosaic() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="flex h-[42vw] max-h-[480px] min-h-[220px] w-full overflow-hidden">
      {mosaicImages.map((img, i) => (
        <div
          key={img.src}
          className="group relative overflow-hidden"
          style={{ flex: i === 2 ? "1.4" : "1" }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="25vw"
            className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:bg-black/0" />
        </div>
      ))}
    </div>
  );
}
