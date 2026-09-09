import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { isProductionDeploy } from "@/lib/storage/config";

export const ADMIN_COOKIE = "admin_session";

const DEFAULT_DEV_SESSION = "tahkon-villat-admin-session-2026";

export function getSessionToken(): string {
  const token = process.env.ADMIN_SESSION_TOKEN?.trim();

  if (isProductionDeploy()) {
    if (!token || token === DEFAULT_DEV_SESSION) {
      throw new Error("ADMIN_SESSION_TOKEN must be configured in production");
    }
    return token;
  }

  return token || DEFAULT_DEV_SESSION;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "";
}

export function isAdminConfigured(): boolean {
  const password = getAdminPassword();
  const token = process.env.ADMIN_SESSION_TOKEN?.trim();

  if (!isProductionDeploy()) {
    return password.length > 0;
  }

  return (
    password.length > 0 &&
    Boolean(token) &&
    token !== DEFAULT_DEV_SESSION
  );
}

export async function isAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) return false;

  try {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_COOKIE)?.value === getSessionToken();
  } catch {
    return false;
  }
}

/**
 * Vertailu vakioajassa: `===` keskeyttää heti ensimmäiseen eroavaan merkkiin,
 * jolloin vastausaika vuotaa tietoa salasanasta. SHA-256 tasaa myös pituuden,
 * joten pituuskaan ei vuoda.
 */
export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (expected.length === 0) return false;

  const given = createHash("sha256").update(password, "utf8").digest();
  const actual = createHash("sha256").update(expected, "utf8").digest();

  return timingSafeEqual(given, actual);
}
