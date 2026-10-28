"use client";

import type { ReactNode } from "react";
import { useRevealOnScroll } from "./useRevealOnScroll";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Clip-path wipe (bottom → top) for content below the fold. Above-the-fold
 * content renders static (see useRevealOnScroll). Reduced-motion safe via globals.css.
 */
export function ClipReveal({ children, className = "", delay = 0 }: Props) {
  const { ref, state } = useRevealOnScroll<HTMLDivElement>(0.9);
  const cls = state === "static" ? "" : `clip-reveal ${state === "shown" ? "is-in" : ""}`;

  return (
    <div
      ref={ref}
      className={`${cls} ${className}`}
      style={state === "shown" ? { transitionDelay: `${Math.min(delay, 200)}ms` } : undefined}
    >
      {children}
    </div>
  );
}
