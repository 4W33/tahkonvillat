"use client";

import Image from "next/image";
import type { PropertyGroup } from "@/lib/admin/property-registry";

type Props = {
  group: PropertyGroup;
  locale: "fi" | "en";
  image: string;
  name: string;
  description: string;
  longDescription?: string;
  area?: string;
};

export function AdminPropertyPreview({
  group,
  locale,
  image,
  name,
  description,
  longDescription,
  area,
}: Props) {
  const paragraphs = longDescription
    ? longDescription
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#F7F4EF] shadow-sm">
      <div className="border-b border-slate-200 bg-white px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Esikatselu · {locale === "fi" ? "Suomi" : "English"}
        </p>
      </div>

      {group === "villa" ? (
        <article>
          <div className="relative aspect-[4/3] bg-slate-100">
            {image ? (
              <Image
                src={image}
                alt={name || "Kohde"}
                fill
                sizes="320px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Ei kansikuvaa
              </div>
            )}
          </div>
          <div className="p-5">
            <h3 className="font-display text-2xl text-[#1C3A2A]">
              {name || (locale === "fi" ? "Nimi" : "Name")}
            </h3>
            <p className="mt-2 font-sans text-sm leading-relaxed text-[#1C3A2A]/80">
              {description ||
                (locale === "fi" ? "Lyhyt kuvaus…" : "Short description…")}
            </p>
            {paragraphs.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-[#1C3A2A]/10 pt-4">
                {paragraphs.slice(0, 2).map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="font-sans text-sm leading-relaxed text-[#1C3A2A]/75"
                  >
                    {paragraph}
                  </p>
                ))}
                {paragraphs.length > 2 && (
                  <p className="font-sans text-xs text-[#1C3A2A]/50">
                    + {paragraphs.length - 2}{" "}
                    {locale === "fi" ? "kappaletta lisää" : "more paragraphs"}
                  </p>
                )}
              </div>
            )}
          </div>
        </article>
      ) : (
        <article>
          <div className="relative aspect-[4/3] bg-slate-100">
            {image ? (
              <Image
                src={image}
                alt={name || "Kohde"}
                fill
                sizes="320px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Ei kansikuvaa
              </div>
            )}
          </div>
          <div className="p-5">
            <h3 className="font-display text-xl text-[#1C3A2A]">
              {name || (locale === "fi" ? "Nimi" : "Name")}
            </h3>
            <p className="mt-2 font-sans text-sm text-[#1C3A2A]/70">
              {area || (locale === "fi" ? "Alue / sijainti" : "Area / location")}
            </p>
            {description && (
              <p className="mt-3 font-sans text-sm leading-relaxed text-[#1C3A2A]/80">
                {description}
              </p>
            )}
          </div>
        </article>
      )}
    </div>
  );
}
