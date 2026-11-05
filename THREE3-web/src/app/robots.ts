import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/** Mientras NEXT_PUBLIC_NOINDEX no sea "0", se pide a los buscadores no indexar nada. */
export default function robots(): MetadataRoute.Robots {
  const cerrado = process.env.NEXT_PUBLIC_NOINDEX !== "0";
  return cerrado
    ? { rules: { userAgent: "*", disallow: "/" } }
    : { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/pagar", "/api/"] }, sitemap: "https://www.three3agency.com/sitemap.xml" };
}
