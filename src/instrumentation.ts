export async function register() {
  // Runtime only — not during `next build` (env vars may be added after first deploy)
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.npm_lifecycle_event !== "build"
  ) {
    const { assertProductionSecrets } = await import("@/lib/storage/config");
    assertProductionSecrets();
  }
}
