"use client";

import { usePathname } from "@/i18n/navigation";

type Props = {
  children: React.ReactNode;
};

export function MainWithNavOffset({ children }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className={isHome ? "flex-1" : "flex-1 pt-[calc(4.75rem+3px)]"}>
      {children}
    </div>
  );
}
