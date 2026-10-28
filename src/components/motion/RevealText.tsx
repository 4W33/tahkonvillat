"use client";

import { createElement, type ReactNode } from "react";
import { useRevealOnScroll } from "./useRevealOnScroll";

type Props = {
  /** Each entry renders as one masked line that slides up in sequence. */
  lines: ReactNode[];
  className?: string;
  /** Heading/element tag to render. */
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
};

/**
 * Editorial line-by-line headline reveal: each line sits in an overflow-hidden
 * track and slides up from below, staggered. Above-the-fold headlines render
 * static (see useRevealOnScroll).
 */
export function RevealText({
  lines,
  className = "",
  as = "h2",
  delay = 0,
}: Props) {
  const { ref, state } = useRevealOnScroll<HTMLElement>(0.9);
  const hidden = state === "hidden";

  return createElement(
    as,
    { ref, className },
    lines.map((line, i) => (
      <span
        key={i}
        style={{ display: "block", overflow: "hidden", paddingBottom: "0.04em" }}
      >
        <span
          style={{
            display: "block",
            transform: hidden ? "translateY(110%)" : "translateY(0)",
            opacity: hidden ? 0 : 1,
            transition:
              state === "shown"
                ? "transform 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.6s cubic-bezier(0.16,1,0.3,1)"
                : undefined,
            transitionDelay: state === "shown" ? `${Math.min(delay, 200) + i * 60}ms` : undefined,
          }}
        >
          {line}
        </span>
      </span>
    )),
  );
}
