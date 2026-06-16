import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api-auth";
import { markInquiryRead, readInquiries } from "@/lib/data/inquiry-store";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const inquiries = await readInquiries();
  return NextResponse.json(inquiries);
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await request.json();
  if (typeof id !== "string") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const ok = await markInquiryRead(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
