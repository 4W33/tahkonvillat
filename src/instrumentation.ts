export async function register() {
  // Runtime only — not during `next build` (env vars may be added after first deploy)
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "production" &&
    process.env.npm_lifecycle_event !== "build"
  ) {
    const missing = ["DATABASE_URL", "PAYLOAD_SECRET", "BLOB_READ_WRITE_TOKEN"].filter((key) => !process.env[key]);
    if (missing.length) throw new Error(`Puuttuvat ympäristömuuttujat: ${missing.join(", ")}`);
  }
}
