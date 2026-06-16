"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll behaviour wrapper. We deliberately use the browser's native scroll
 * (no smooth-scroll hijacking library) so vertical scrolling is always
 * reliable and never feels locked — important for the booking flow. This only
 * resets scroll position on route change.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}
