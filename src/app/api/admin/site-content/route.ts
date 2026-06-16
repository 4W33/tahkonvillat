import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { revalidateSiteContent } from "@/lib/admin/revalidate-site";
import { getSiteMessagesValidationError } from "@/lib/admin/validate-site-messages";
import {
  getAllSiteMessages,
  writeSiteMessages,
  type SiteMessages,
} from "@/lib/data/site-messages-store";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const messages = await getAllSiteMessages();
  return NextResponse.json(messages);
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = (await request.json()) as {
      locale?: string;
      messages?: SiteMessages;
    };

    if (body.locale !== "fi" && body.locale !== "en") {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const validationError = getSiteMessagesValidationError(body.messages);
    if (validationError) {
      return NextResponse.json(
        { error: `Invalid messages: ${validationError}` },
        { status: 400 },
      );
    }

    await writeSiteMessages(body.locale, body.messages as SiteMessages);
    revalidateSiteContent();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
