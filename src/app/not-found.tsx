import Link from "next/link";
import { getLang } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";

export default async function NotFound() {
  const t = dictionaries[await getLang()].errors;
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-5xl font-semibold text-forest-900">{t.notFoundTitle}</h1>
      <p className="mt-3 text-muted">{t.notFoundText}</p>
      <Link href="/" className="btn btn-primary mt-8">{t.goHome}</Link>
    </div>
  );
}
