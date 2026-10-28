import { notifiedValue } from "@/payload/collections/Messages";
import type { InquiryPayload, StoredInquiry } from "@/types/inquiry";

export function buildInquiryEntry(payload: InquiryPayload): StoredInquiry {
  return {
    ...payload,
    id: `inq-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
    notified: null,
  };
}

/** Palauttaa luodun dokumentin id:n. */
export async function appendInquiry(entry: StoredInquiry): Promise<number | string> {
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const doc = await payload.create({
    collection: "inquiries",
    overrideAccess: true,
    data: {
      villaSlug: entry.villaSlug,
      villaName: entry.villaName,
      name: entry.name,
      email: entry.email,
      phone: entry.phone,
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      guests: entry.guests,
      message: entry.message,
      locale: entry.locale,
      read: false,
      notified: notifiedValue(entry.notified),
    },
  });
  return doc.id;
}
