"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { FaqItem } from "@/lib/content/faq";

const fallbackIds = [
  "pets",
  "bedLinens",
  "checkInOut",
  "cleaning",
  "keys",
  "kitchen",
  "cancellation",
  "booking",
] as const;

type Props = {
  locale: "fi" | "en";
  items?: FaqItem[];
};

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[color:var(--hairline)] last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left transition-colors duration-200 hover:bg-paper"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
          {question}
        </span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-[color:var(--hairline)] font-mono text-lg text-ink transition-transform duration-300 ease-out-expo ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden
        >
          +
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out-expo ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 font-sans text-sm leading-relaxed text-forest-700 sm:text-base">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ locale, items }: Props) {
  const t = useTranslations("faq.items");
  const [openId, setOpenId] = useState<string | null>(
    items?.[0]?.id ?? fallbackIds[0],
  );

  if (items?.length) {
    return (
      <div className="card overflow-hidden">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            question={item.question[locale]}
            answer={item.answer[locale]}
            isOpen={openId === item.id}
            onToggle={() =>
              setOpenId(openId === item.id ? null : item.id)
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {fallbackIds.map((id) => (
        <AccordionItem
          key={id}
          question={t(`${id}.question`)}
          answer={t(`${id}.answer`)}
          isOpen={openId === id}
          onToggle={() => setOpenId(openId === id ? null : id)}
        />
      ))}
    </div>
  );
}
