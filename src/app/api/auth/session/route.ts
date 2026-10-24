import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_EXPIRES_IN_MS } from "@/lib/auth-constants";

// Simple in-memory rate limiting: 5 attempts per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing or invalid idToken" }, { status: 400 });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();
    if (!auth || !db) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    // 1. Verify token to get user identity
    const decoded = await auth.verifyIdToken(idToken, true);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: "Invalid identity token" }, { status: 401 });
    }

    // 2. Strict authorization: verify user is registered in admin_users collection with role === "admin"
    const adminDoc = await db.collection("admin_users").doc(decoded.uid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      console.warn(`[Security Alert] Non-admin user (${decoded.uid} / ${decoded.email}) attempted to create admin session.`);
      return NextResponse.json(
        { error: "Access denied. Your account is not an authorized administrator." },
        { status: 403 }
      );
    }

    // 3. Create a 14-day session cookie for the authorized admin
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN_MS });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
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
