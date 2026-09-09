import { NextResponse } from "next/server";
import { appendContact, buildContactEntry } from "@/lib/data/contact-store";
import { sendContactNotification, toNotifiedFlag } from "@/lib/email/send";
import type { ContactPayload } from "@/types/contact";

function isValidPayload(body: unknown): body is ContactPayload {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;

  return (
    typeof data.name === "string" &&
    typeof data.email === "string" &&
    typeof data.message === "string" &&
    typeof data.locale === "string" &&
    (data.topic === "villa" ||
      data.topic === "apartment" ||
      data.topic === "general") &&
    data.name.trim().length > 0 &&
    data.email.includes("@") &&
    data.message.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid contact data" }, { status: 400 });
    }

    const entry = buildContactEntry(body);

    // Lähetetään ensin, tallennetaan sitten tila mukaan — viesti säilyy inboxissa
    // vaikka sähköposti epäonnistuisi, ja admin näkee epäonnistumisen.
    let notified: boolean | null = null;
    try {
      notified = toNotifiedFlag(await sendContactNotification(entry));
    } catch (error) {
      console.error("Contact email failed:", error);
      notified = false;
    }

    await appendContact({ ...entry, notified });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
