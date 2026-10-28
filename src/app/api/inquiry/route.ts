import { NextResponse } from "next/server";
import { appendInquiry, buildInquiryEntry } from "@/lib/data/inquiry-store";
import { hasValidSender, markNotified } from "@/lib/data/message-guard";
import { sendInquiryNotification, toNotifiedFlag } from "@/lib/email/send";
import type { InquiryPayload } from "@/types/inquiry";

function isValidPayload(body: unknown): body is InquiryPayload {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;

  return (
    typeof data.villaSlug === "string" &&
    typeof data.villaName === "string" &&
    hasValidSender(data) &&
    typeof data.checkIn === "string" &&
    typeof data.checkOut === "string" &&
    typeof data.guests === "number" &&
    typeof data.locale === "string" &&
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
    // Tallennetaan ensin: viesti ei katoa, vaikka sähköposti tai tilan päivitys epäonnistuisi.
    const id = await appendInquiry(entry);
    let notified: boolean | null = null;
    try {
      notified = toNotifiedFlag(await sendInquiryNotification(entry));
    } catch (error) {
      console.error("Inquiry email failed:", error);
      notified = false;
    }

    await markNotified("inquiries", id, notified);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
  }
}
