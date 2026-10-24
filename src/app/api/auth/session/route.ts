import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";

export const SESSION_COOKIE = "nm_session";
// 14 days in milliseconds
const EXPIRES_IN = 14 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing or invalid idToken" }, { status: 400 });
    }

    const auth = getAdminAuth();
    if (!auth) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    // Verify token and create a 14-day session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      maxAge: EXPIRES_IN / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
