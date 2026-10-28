"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "static": näkyy ilman animaatiota (SSR, näkymässä heti latauksessa, reduced motion).
 * "hidden" → "shown": elementti oli näkymän alapuolella ja animoituu, kun se vieritetään esiin.
 * SSR renderöi aina näkyvänä, joten mitään ei piiloteta ennen hydraatiota.
 * Vierityssijainnin tarkistus IntersectionObserverin sijaan (projektin sääntö).
 */
export type RevealState = "static" | "hidden" | "shown";

export function useRevealOnScroll<T extends HTMLElement>(threshold = 0.92) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const inView = () => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * threshold && rect.bottom > 0;
    };
    if (inView()) return;

    setState("hidden");
    const onScroll = () =>
      requestAnimationFrame(() => {
        if (inView()) reveal();
      });
    // Turvaverkko: sisältö ei jää koskaan piiloon.
    const safety = window.setTimeout(() => reveal(), 3000);
    function reveal() {
      setState("shown");
      cleanup();
    }
    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(safety);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return cleanup;
  }, [threshold]);

  return { ref, state };
}
