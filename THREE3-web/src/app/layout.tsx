import type { Metadata, Viewport } from "next";
import { Anton, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "THREE3 · Automatiza tu negocio",
  description: "Chatbot, CRM y captación de clientes conectados desde Instagram. Automatiza tu negocio y conecta cada cliente.",
};

export const viewport: Viewport = { themeColor: "#071022" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PE" className={`${anton.variable} ${bricolage.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
