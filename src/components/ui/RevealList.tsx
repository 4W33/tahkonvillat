"use client";

import { Children, type ReactNode } from "react";
import { Reveal } from "./Reveal";

type Props = {
  children: ReactNode;
  className?: string;
  stagger?: number;
};

export function RevealList({
  children,
  className = "",
  stagger = 80,
}: Props) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        <Reveal key={index} delay={index * stagger}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
