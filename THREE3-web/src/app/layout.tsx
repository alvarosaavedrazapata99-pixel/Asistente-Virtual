import type { Metadata, Viewport } from "next";
import { Inter, Michroma } from "next/font/google";
import "./globals.css";

const michroma = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-michroma", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Por seguridad, la web NO se indexa en Google hasta el lanzamiento: en producción se define NEXT_PUBLIC_NOINDEX=0.
const noindex = process.env.NEXT_PUBLIC_NOINDEX !== "0";

export const metadata: Metadata = {
  title: "THREE3 · Bots para tu negocio",
  robots: noindex ? { index: false, follow: false } : undefined,
  description: "Bots de atención y captación para tu negocio, con cuidado mensual incluido. Agenda un diagnóstico gratis de 20 a 30 minutos.",
};

export const viewport: Viewport = { themeColor: "#040814" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PE" className={`${michroma.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
