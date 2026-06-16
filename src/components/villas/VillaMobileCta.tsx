"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function VillaMobileCta() {
  const t = useTranslations("villas.detail.mobileCta");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("villa-inquiry");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHidden(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: "0px 0px -72px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest/10 bg-cream/95 p-4 backdrop-blur-md lg:hidden">
      <a href="#villa-inquiry" className="btn-primary w-full">
        {t("label")}
      </a>
    </div>
  );
}
