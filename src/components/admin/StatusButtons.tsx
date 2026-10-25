"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProductStatusAction } from "@/app/admin/actions";
import { useLang } from "@/components/Providers";

export function StatusButtons({ id, status }: { id: string; status: "draft" | "active" | "archived" }) {
  const router = useRouter();
  const { t } = useLang();
  const act = t.admin.products.actions;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const change = (next: "draft" | "active" | "archived") =>
    start(async () => {
      if (next === "archived" && !window.confirm(act.confirmArchive)) return;
      const res = await setProductStatusAction(id, next);
      if (!res.ok) setError(res.error);
      else {
        setError(null);
        router.refresh();
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "active" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("active")}
          className="rounded-full border border-forest-800 px-3 py-1 text-sm font-semibold text-forest-800 hover:bg-forest-50"
        >
          {act.activate}
        </button>
      )}
      {status === "active" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("draft")}
          className="rounded-full border border-line px-3 py-1 text-sm font-semibold hover:bg-ivory"
        >
          {act.deactivate}
        </button>
      )}
      {status !== "archived" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("archived")}
          className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-danger hover:bg-[#fbeae6]"
        >
          {act.archive}
        </button>
      )}
      {error && <span role="alert" className="text-sm text-danger">{error}</span>}
    </div>
  );
}
