import { notifiedValue } from "@/payload/collections/Messages";
import { readStoreJson, writeStoreJson } from "@/lib/storage/json";
import type { ContactPayload, StoredContact } from "@/types/contact";

const CONTACTS_PATH = "data/contacts.json";

export async function readContacts(): Promise<StoredContact[]> {
  const data = await readStoreJson<StoredContact[]>(CONTACTS_PATH);
  if (!Array.isArray(data)) return [];
  return data.map(normalizeContact);
}

function normalizeContact(entry: Record<string, unknown>): StoredContact {
  return {
    id: String(entry.id ?? ""),
    createdAt: String(entry.createdAt ?? ""),
    read: Boolean(entry.read),
    name: String(entry.name ?? ""),
    email: String(entry.email ?? ""),
    phone: entry.phone ? String(entry.phone) : undefined,
    topic: entry.topic as StoredContact["topic"],
    message: String(entry.message ?? ""),
    locale: String(entry.locale ?? "fi"),
    notified: typeof entry.notified === "boolean" ? entry.notified : null,
  };
}

export function buildContactEntry(payload: ContactPayload): StoredContact {
  return {
    ...payload,
    id: `cnt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
    notified: null,
  };
}

export async function appendContact(entry: StoredContact): Promise<StoredContact> {
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  await payload.create({
    collection: "contacts",
    overrideAccess: true,
    data: {
      name: entry.name,
      email: entry.email,
      phone: entry.phone,
      topic: entry.topic,
      message: entry.message,
      locale: entry.locale,
      read: false,
      notified: notifiedValue(entry.notified),
    },
  });
  return entry;
}

export async function markContactRead(id: string): Promise<boolean> {
  const contacts = await readContacts();
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return false;

  contacts[index] = { ...contacts[index], read: true };
  await writeStoreJson(CONTACTS_PATH, contacts);
  return true;
}
