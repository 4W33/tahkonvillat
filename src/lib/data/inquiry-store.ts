import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import type { InquiryPayload, StoredInquiry } from "@/types/inquiry";

const INQUIRIES_PATH = "data/inquiries.json";

export async function readInquiries(): Promise<StoredInquiry[]> {
  const data = await readStoreJson<StoredInquiry[]>(INQUIRIES_PATH);
  if (!Array.isArray(data)) return [];
  return data.map(normalizeInquiry);
}

function normalizeInquiry(entry: Record<string, unknown>): StoredInquiry {
  return {
    id: String(entry.id ?? ""),
    createdAt: String(entry.createdAt ?? ""),
    read: Boolean(entry.read),
    villaSlug: String(entry.villaSlug ?? ""),
    villaName: String(entry.villaName ?? ""),
    name: String(entry.name ?? ""),
    email: String(entry.email ?? ""),
    phone: entry.phone ? String(entry.phone) : undefined,
    checkIn: String(entry.checkIn ?? ""),
    checkOut: String(entry.checkOut ?? ""),
    guests: Number(entry.guests ?? 0),
    message: String(entry.message ?? ""),
    locale: String(entry.locale ?? "fi"),
    notified: typeof entry.notified === "boolean" ? entry.notified : null,
  };
}

export function buildInquiryEntry(payload: InquiryPayload): StoredInquiry {
  return {
    ...payload,
    id: `inq-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
    notified: null,
  };
}

export async function appendInquiry(entry: StoredInquiry): Promise<StoredInquiry> {
  const existing = await readInquiries();
  existing.unshift(entry);
  await writeStoreJson(INQUIRIES_PATH, existing);
  return entry;
}

export async function markInquiryRead(id: string): Promise<boolean> {
  const inquiries = await readInquiries();
  const index = inquiries.findIndex((i) => i.id === id);
  if (index === -1) return false;

  inquiries[index] = { ...inquiries[index], read: true };
  await writeStoreJson(INQUIRIES_PATH, inquiries);
  return true;
}
