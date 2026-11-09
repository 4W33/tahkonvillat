"use client";

import { useEffect, useRef } from "react";

type Props = {
  message: string;
};

export function FormSuccess({ message }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Lähetysnappi poistuu DOMista: siirretään fokus ilmoitukseen, ettei se katoa bodyyn
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className="flex animate-fade-in flex-col items-center px-4 py-10 text-center outline-none"
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
        <svg
          viewBox="0 0 52 52"
          className="h-12 w-12"
          aria-hidden
        >
          <circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-forest/20"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 27l7 7 16-16"
            className="text-forest"
            style={{
              strokeDasharray: 48,
              strokeDashoffset: 48,
              animation: "check-draw 0.6s ease-out 0.15s forwards",
            }}
          />
        </svg>
      </div>
      <p className="mt-5 max-w-sm font-sans text-[0.9375rem] leading-relaxed text-forest-700">
        {message}
      </p>
    </div>
  );
}
