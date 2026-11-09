import { getTranslations } from "next-intl/server";

type Props = {
  variant?: "light" | "dark";
};

export async function ApartmentEmptyState({ variant = "light" }: Props) {
  const t = await getTranslations("apartments.empty");
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "rounded-none border border-paper/15 px-6 py-14 text-center"
          : "rounded-none border border-[color:var(--hairline)] bg-paper-50 px-6 py-14 text-center"
      }
    >
      <p
        className={`font-display text-4xl font-semibold tracking-tight ${isDark ? "text-paper" : "text-ink"}`}
      >
        {t("title")}
      </p>
      <p
        className={`mx-auto mt-3 max-w-md font-sans text-[0.9375rem] leading-relaxed ${
          isDark ? "text-paper/75" : "text-forest-700"
        }`}
      >
        {t("subtitle")}
      </p>
    </div>
  );
}
