import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  getSessionToken,
  isAdminConfigured,
  verifyPassword,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "Admin is not configured on this server" },
        { status: 503 },
      );
    }

    const { password } = await request.json();

    if (typeof password !== "string" || !verifyPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, getSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
