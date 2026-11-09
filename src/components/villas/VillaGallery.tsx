"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatImageAlt } from "@/lib/format-image-alt";

type Props = {
  images: string[];
  alt: string;
  variant?: "hero" | "card";
};

export function VillaGallery({ images, alt, variant = "hero" }: Props) {
  const t = useTranslations("villas.detail.gallery");
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const displayAlt = formatImageAlt(alt);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const showImage = useCallback(
    (index: number) => {
      setActive((index + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showImage(active - 1);
      if (event.key === "ArrowRight") showImage(active + 1);
      // Pidetään Tab-fokus dialogin napeissa
      if (event.key === "Tab") {
        const buttons = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        const current = document.activeElement;
        if (event.shiftKey ? current === first : current === last) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (!dialogRef.current?.contains(current)) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, active, showImage]);

  // Avatessa fokus sulkunappiin, sulkiessa takaisin avanneeseen elementtiin
  useEffect(() => {
    if (!lightboxOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus();
  }, [lightboxOpen]);

  const navBtnClass =
    "absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-none bg-ink/80 font-sans text-xl text-paper opacity-90 transition-opacity hover:bg-ink/90 focus-visible:opacity-100 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100";

  return (
    <>
      <div>
        <div
          className={`group relative overflow-hidden rounded-none bg-ink/5 ${
            variant === "card" ? "aspect-[4/3]" : "aspect-[16/10]"
          }`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 z-10"
            aria-label={t("openLightbox")}
          />
          <Image
            src={images[active]}
            alt={displayAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.02]"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showImage(active - 1);
                }}
                className={`${navBtnClass} left-3`}
                aria-label={t("prev")}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showImage(active + 1);
                }}
                className={`${navBtnClass} right-3`}
                aria-label={t("next")}
              >
                ›
              </button>
              <p className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-none bg-ink/75 px-2.5 py-1 font-sans text-[0.9375rem] text-paper">
                {active + 1} / {images.length}
              </p>
            </>
          )}

          <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-none bg-ink/75 px-2.5 py-1 font-sans text-[0.9375rem] text-paper opacity-90 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            {t("expand")}
          </span>
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(index)}
                className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-none ring-2 transition-all sm:w-24 ${
                  active === index
                    ? "ring-ink"
                    : "ring-transparent opacity-75 hover:opacity-100"
                }`}
                aria-label={`${displayAlt} ${index + 1}`}
                aria-current={active === index}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("lightboxTitle")}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-none bg-paper/10 font-sans text-2xl text-paper transition-colors hover:bg-paper/20 sm:right-6 sm:top-6"
            aria-label={t("close")}
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => showImage(active - 1)}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-none bg-paper/10 font-sans text-2xl text-paper transition-colors hover:bg-paper/20 sm:left-6"
                aria-label={t("prev")}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => showImage(active + 1)}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-none bg-paper/10 font-sans text-2xl text-paper transition-colors hover:bg-paper/20 sm:right-6"
                aria-label={t("next")}
              >
                ›
              </button>
            </>
          )}

          <div className="relative h-[70vh] w-full max-w-6xl">
            <Image
              src={images[active]}
              alt={displayAlt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-sans text-[0.9375rem] text-paper/80">
            {active + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
