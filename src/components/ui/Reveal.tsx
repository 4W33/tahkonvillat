"use client";

import type { ReactNode } from "react";
import { useRevealOnScroll } from "@/components/motion/useRevealOnScroll";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Fade-and-rise vain näkymän alapuolella olevalle sisällölle; ks. useRevealOnScroll. */
export function Reveal({ children, className = "", delay = 0 }: Props) {
  const { ref, state } = useRevealOnScroll<HTMLDivElement>();

  const motion =
    state === "static"
      ? ""
      : `transition-[opacity,transform] duration-500 ease-out-expo ${
          state === "shown" ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`;

  return (
    <div
      ref={ref}
      className={`${motion} ${className}`}
      style={state === "shown" ? { transitionDelay: `${Math.min(delay, 200)}ms` } : undefined}
    >
      {children}
    </div>
  );
}
