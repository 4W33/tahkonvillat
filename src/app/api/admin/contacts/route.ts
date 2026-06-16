import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { markContactRead, readContacts } from "@/lib/data/contact-store";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const contacts = await readContacts();
  return NextResponse.json(contacts);
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (typeof id !== "string") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const ok = await markContactRead(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
