import { revalidatePath } from "next/cache";

type HookArgs = { context?: Record<string, unknown> };

/**
 * Mikä tahansa sisältömuutos → koko sivusto uudelleen (n. 15 sivua, kevyt).
 * Seed-skripti ajaa Next-kontekstin ulkopuolella → `context.disableRevalidate`.
 */
export function revalidateSite({ context }: HookArgs = {}): void {
  if (context?.disableRevalidate) return;
  revalidatePath("/", "layout");
}

export const revalidateHooks = {
  afterChange: [(args: HookArgs) => revalidateSite(args)],
  afterDelete: [(args: HookArgs) => revalidateSite(args)],
};
