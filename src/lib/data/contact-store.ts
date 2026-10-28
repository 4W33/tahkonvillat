import { notifiedValue } from "@/payload/collections/Messages";
import type { ContactPayload, StoredContact } from "@/types/contact";

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
