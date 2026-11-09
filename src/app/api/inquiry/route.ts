import { NextResponse } from "next/server";
import { appendInquiry, buildInquiryEntry } from "@/lib/data/inquiry-store";
import { getVillaBySlug } from "@/lib/content/villas";
import { hasValidSender, hasValidStay, isHoneypotFilled, isSiteLocale, markNotified } from "@/lib/data/message-guard";
import { sendInquiryNotification, toNotifiedFlag } from "@/lib/email/send";
import type { InquiryPayload } from "@/types/inquiry";

function isValidPayload(body: unknown): body is Omit<InquiryPayload, "villaName"> {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;

  return hasValidStay(data) && hasValidSender(data) && isSiteLocale(data.locale);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Botti: näennäinen onnistuminen, ei tallennusta eikä sähköpostia.
    if (isHoneypotFilled(body)) return NextResponse.json({ ok: true });

    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid inquiry data" }, { status: 400 });
    }

    // Villan nimi kannasta, ei asiakkaalta: tuntematon slug hylätään.
    const villa = await getVillaBySlug(body.villaSlug);
    if (!villa) {
      return NextResponse.json({ error: "Invalid inquiry data" }, { status: 400 });
    }

    const entry = buildInquiryEntry({ ...body, villaName: villa.name[body.locale as "fi" | "en"] || villa.name.fi });
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
