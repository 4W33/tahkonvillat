import { NextResponse } from "next/server";
import { appendInquiry, buildInquiryEntry } from "@/lib/data/inquiry-store";
import { sendInquiryNotification, toNotifiedFlag } from "@/lib/email/send";
import type { InquiryPayload } from "@/types/inquiry";

function isValidPayload(body: unknown): body is InquiryPayload {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;

  return (
    typeof data.villaSlug === "string" &&
    typeof data.villaName === "string" &&
    typeof data.name === "string" &&
    typeof data.email === "string" &&
    typeof data.checkIn === "string" &&
    typeof data.checkOut === "string" &&
    typeof data.guests === "number" &&
    typeof data.message === "string" &&
    typeof data.locale === "string" &&
    data.name.trim().length > 0 &&
    data.email.includes("@") &&
    data.message.trim().length > 0 &&
    data.guests > 0 &&
    data.checkOut > data.checkIn
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid inquiry data" }, { status: 400 });
    }

    const entry = buildInquiryEntry(body);

    let notified: boolean | null = null;
    try {
      notified = toNotifiedFlag(await sendInquiryNotification(entry));
    } catch (error) {
      console.error("Inquiry email failed:", error);
      notified = false;
    }

    await appendInquiry({ ...entry, notified });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
  }
}
