import { notFound } from "next/navigation";

/** Tuntematon polku kielen alla → lokalisoitu not-found.tsx (sivuston ilme ja oikea kieli). */
export default function CatchAllPage() {
  notFound();
}
