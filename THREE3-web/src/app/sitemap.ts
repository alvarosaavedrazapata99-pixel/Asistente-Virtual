import type { MetadataRoute } from "next";
import { DETALLES } from "@/lib/detalles";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.three3agency.com";
  return [{ url: `${base}/`, changeFrequency: "monthly", priority: 1 }, { url: `${base}/legal`, changeFrequency: "yearly", priority: 0.3 }, ...DETALLES.map((d) => ({ url: `${base}/mas/${d.id}`, changeFrequency: "monthly" as const, priority: 0.6 }))];
}
