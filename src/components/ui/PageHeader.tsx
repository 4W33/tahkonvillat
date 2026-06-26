import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  narrow?: boolean;
  className?: string;
  image?: string;
  imageAlt?: string;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
  narrow = false,
  className = "",
  image,
  imageAlt = "",
}: Props) {
  const withImage = Boolean(image);

  if (withImage) {
    return (
      <section
        className={`relative flex min-h-[40vh] items-end overflow-hidden sm:min-h-[46vh] ${className}`}
      >
        <Image
          src={image!}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
          <p className="eyebrow text-paper/85">{eyebrow}</p>
          <h1 className="section-title mt-2 text-balance text-paper">{title}</h1>
          {subtitle && (
            <p
              className={`mt-5 font-sans text-base leading-relaxed text-paper/90 sm:text-lg ${
                narrow ? "max-w-2xl" : "max-w-3xl"
              }`}
            >
              {subtitle}
            </p>
          )}
          {children && <div className="mt-4 text-paper/80 [&_a]:text-paper [&_a]:underline-offset-4 hover:[&_a]:underline">{children}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className={`page-header ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="section-title mt-2 text-balance">{title}</h1>
        {subtitle && (
          <p
            className={`mt-5 font-sans text-base leading-relaxed text-forest-700 sm:text-lg ${
              narrow ? "max-w-2xl" : "max-w-3xl"
            }`}
          >
            {subtitle}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </section>
  );
}
