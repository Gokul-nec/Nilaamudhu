import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdmin } from "@/lib/admin";
import { getLang } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { signOutAction } from "../actions";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  if (await getAdmin()) redirect("/admin/dashboard");
  const [, lang] = await Promise.all([Promise.resolve(), getLang()]);
  const t = dictionaries[lang].admin.login;
  const configured = isFirebaseConfigured();

  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.backToWebsite}</span>
          </Link>
        </div>

        <Link href="/" className="block text-center" title="Return to Nilaamudhu store">
          <Image
            src="/logo.png"
            alt="Nilaamudhu"
            width={582}
            height={570}
            className="mx-auto h-24 w-auto transition-transform hover:scale-105"
          />
        </Link>
        <h1 className="mt-4 text-center text-3xl font-semibold text-forest-900">{t.title}</h1>
        {!configured && (
          <p role="alert" className="mt-4 rounded-xl bg-[#fbeccb] p-3 text-sm">
            Firebase isn&apos;t configured yet. Add your Firebase credentials (see .env.example).
          </p>
        )}
        {denied && (
          <div role="alert" className="mt-4 rounded-xl bg-[#f6dcd6] p-3 text-sm text-danger">
            <p>{t.deniedAlert}</p>
            <form action={signOutAction} className="mt-2">
              <button className="font-semibold underline" type="submit">
                {t.signOut}
              </button>
            </form>
          </div>
        )}
        {configured && <LoginForm />}

        <div className="mt-6 border-t border-line pt-4 text-center">
          <Link
            href="/"
            className="text-xs text-muted hover:text-forest-900 transition-colors"
          >
            © {new Date().getFullYear()} Nilaamudhu
          </Link>
        </div>
      </div>
    </div>
  );
}
