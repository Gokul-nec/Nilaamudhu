import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Read .env.local
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();

if (!clientEmail || !privateKey || !projectId || clientEmail.includes("YOUR-")) {
  console.error("Error: FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and PROJECT_ID must be filled in .env.local");
  process.exit(1);
}

privateKey = privateKey.replace(/\\n/g, "\n");

const app = initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.log("Usage: node scripts/create-admin.mjs <admin-email> <admin-password>");
  process.exit(1);
}

async function run() {
  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`Found existing user with UID: ${user.uid}`);
    } catch {
      user = await auth.createUser({
        email,
        password,
        emailVerified: true,
      });
      console.log(`Created new Firebase user with UID: ${user.uid}`);
    }

    // Assign admin role in Firestore "admin_users" collection
    await db.collection("admin_users").doc(user.uid).set({
      user_id: user.uid,
      email: user.email,
      role: "admin",
      created_at: new Date().toISOString(),
    });

    console.log(`Successfully granted admin privileges to ${email}!`);
    console.log("You can now sign in at http://localhost:3000/admin/login");
    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin:", err);
    process.exit(1);
  }
}

run();
