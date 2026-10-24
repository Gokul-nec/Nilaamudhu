"use client";

import { useLang } from "@/components/Providers";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const { t } = useLang();
  return (
    <div className="container-page py-24 text-center" role="alert">
      <h1 className="text-4xl font-semibold text-forest-900">{t.common.somethingWrong}</h1>
      <p className="mt-3 text-muted">{t.common.somethingWrongHint}</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-8">{t.common.retry}</button>
    </div>
  );
}
