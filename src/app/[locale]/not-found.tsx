import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";

export default async function NotFoundPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <main className="flex min-h-[65vh] flex-col items-center justify-center px-6 py-20 text-center">
      <Reveal>
        <p className="display-xl text-8xl text-ink/12 sm:text-9xl">404</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tightest text-ink sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-forest-700 sm:text-base">
          {t("description")}
        </p>
        <Link href="/" className="btn-primary mt-10">
          {t("cta")}
        </Link>
      </Reveal>
    </main>
  );
}
