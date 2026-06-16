"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Reveal immediately on mount (above-the-fold) instead of on scroll. */
  immediate?: boolean;
  delay?: number;
};

/**
 * Reveals its contents with a clip-path wipe (bottom → top) as it enters the
 * viewport. Uses a scroll-position check (reliable with Lenis and after GSAP
 * reflows, unlike IntersectionObserver) plus a safety timeout, so content is
 * never left permanently hidden. Reduced-motion safe via globals.css.
 */
export function ClipReveal({
  children,
  className = "",
  immediate = false,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (immediate) {
      const id = window.setTimeout(() => setShow(true), delay + 60);
      return () => window.clearTimeout(id);
    }
    const el = ref.current;
    if (!el) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      window.setTimeout(() => setShow(true), delay);
      cleanup();
    };
    const check = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) reveal();
    };
    const onScroll = () => requestAnimationFrame(check);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // Safety net: never leave content hidden if scroll events misbehave.
    const safety = window.setTimeout(reveal, 3000);
    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(safety);
    }

    check();
    return cleanup;
  }, [immediate, delay]);

  return (
    <div ref={ref} className={`clip-reveal ${show ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}
