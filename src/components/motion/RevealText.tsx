"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
 * track and slides up from below, staggered. Falls back to plain visible text
 * under reduced-motion (handled via the `is-in` class default state).
 */
export function RevealText({
  lines,
  className = "",
  as = "h2",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      cleanup();
    };
    const check = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) reveal();
    };
    const onScroll = () => requestAnimationFrame(check);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const safety = window.setTimeout(reveal, 3000);
    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(safety);
    }

    check();
    return cleanup;
  }, []);

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
            transform: visible ? "translateY(0)" : "translateY(110%)",
            opacity: visible ? 1 : 0,
            transition:
              "transform 1s cubic-bezier(0.16,1,0.3,1), opacity 1s cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: `${delay + i * 90}ms`,
          }}
        >
          {line}
        </span>
      </span>
    )),
  );
}
