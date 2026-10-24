# Nilaamudhu Traditional Products: website (Version 1)

Bilingual (Tamil/English) catalogue with a multi-product cart that opens a pre-filled **WhatsApp** order message.
No payment gateway in V1. Built by GODAX with Next.js (App Router), TypeScript, Tailwind CSS v4, and Firebase (Authentication, Cloud Firestore, Admin SDK).

## 1. Local setup
```bash
npm install                  # Installs dependencies
cp .env.example .env.local   # Fill in Firebase credentials (see section 2)
npm run dev                  # http://localhost:3000
```
Other scripts: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## 2. Firebase Setup (100% Free on Spark Plan — No Credit Card Required)
1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project** (e.g. `nilaamudhu`).
2. **Authentication**: Go to **Build > Authentication** > **Get Started**. Under **Sign-in method**, enable **Email/Password** and click Save.
3. **Cloud Firestore**: Go to **Build > Firestore Database** > **Create database**.
   - Choose location: `asia-south1` (Mumbai) for optimal speed in India.
   - Start in Production mode. Copy the rules from `firestore.rules` into the **Rules** tab in Firebase Console and click **Publish**.
4. **Web Configuration**: Go to **Project Settings (gear icon) > General > Your apps**. Click the **Web `</>`** icon to register an app. Copy the `firebaseConfig` keys into `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
5. **Admin SDK Private Key**: In **Project Settings**, go to the **Service accounts** tab. Click **Generate new private key** (downloads a `.json` file).
   - Add `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` to `.env.local`.

## 3. Create the First Admin Account (Two Easy Options)

### Option A: Using the Automated Script
Run the helper script with your desired admin email and password:
```bash
node scripts/create-admin.mjs your-admin@example.com your-secure-password
```

### Option B: Manually in the Firebase Console
1. **Authentication > Users > Add user**: Enter your email and password. Copy the created User UID.
2. **Firestore Database > Start collection**:
   - Collection ID: `admin_users`
   - Document ID: Paste your **User UID**
   - Fields:
     - `role`: string = `admin`
     - `email`: string = your email
     - `user_id`: string = your User UID
3. Sign in at `http://localhost:3000/admin/login`.
4. Open **Settings** in the admin panel and set your WhatsApp number with country code (e.g. `919876543210`).

## 4. How It Works
- **Fast Local Loading**: Invalid/placeholder credentials safely fall back to static defaults without any network delays or DNS hangs.
- **Admin Authentication**: Uses Firebase Authentication with an HTTP-only cryptographic session cookie (`nm_session`) for server-rendered admin pages and server actions.
- **Admin Authorization**: Verified both in middleware route protection and server-side against the `admin_users` collection in Firestore.
- **Cart Validation**: Cart pricing is re-calculated server-side from Firestore. Anonymous users only read active products.
- **Image Handling**: Direct image file uploads are currently paused pending storage setup; image URLs and local paths (e.g. `/logo.png`) are supported directly.
