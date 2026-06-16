import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  narrow?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
  narrow = false,
}: Props) {
  return (
    <section className="page-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="section-title mt-4 text-balance">{title}</h1>
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
