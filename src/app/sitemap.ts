import type { MetadataRoute } from "next";
import { getAllActiveSlugs } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const products = await getAllActiveSlugs();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
