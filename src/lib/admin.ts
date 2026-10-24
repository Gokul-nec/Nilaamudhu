import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "./firebase/admin";
import { SESSION_COOKIE } from "@/app/api/auth/session/route";

export interface AdminSession {
  user: {
    id: string;
    email: string;
  };
  db: NonNullable<ReturnType<typeof getAdminDb>>;
}

/**
 * Returns the authenticated admin user only when they have a valid Firebase session
 * and an explicit document in the Firestore "admin_users" collection with role "admin".
 */
export async function getAdmin(): Promise<AdminSession | null> {
  if (!isAdminConfigured()) return null;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return null;

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    if (!decoded || !decoded.uid) return null;

    // Check admin_users collection in Firestore
    const adminDoc = await db.collection("admin_users").doc(decoded.uid).get();
    if (!adminDoc.exists) return null;
    const data = adminDoc.data();
    if (data?.role !== "admin") return null;

    return {
      user: {
        id: decoded.uid,
        email: decoded.email ?? "",
      },
      db,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login?denied=1");
  return admin;
}
