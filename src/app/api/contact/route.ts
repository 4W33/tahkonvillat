import { NextResponse } from "next/server";
import { appendContact, buildContactEntry } from "@/lib/data/contact-store";
import { hasValidSender, markNotified } from "@/lib/data/message-guard";
import { sendContactNotification, toNotifiedFlag } from "@/lib/email/send";
import type { ContactPayload } from "@/types/contact";

function isValidPayload(body: unknown): body is ContactPayload {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;

  return (
    hasValidSender(data) &&
    typeof data.locale === "string" &&
    (data.topic === "villa" ||
      data.topic === "apartment" ||
      data.topic === "general")
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid contact data" }, { status: 400 });
    }

    const entry = buildContactEntry(body);

    // Tallennetaan ensin: viesti ei katoa, vaikka sähköposti tai tilan päivitys epäonnistuisi.
    const id = await appendContact(entry);
    let notified: boolean | null = null;
    try {
      notified = toNotifiedFlag(await sendContactNotification(entry));
    } catch (error) {
      console.error("Contact email failed:", error);
      notified = false;
    }

    await markNotified("contacts", id, notified);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
