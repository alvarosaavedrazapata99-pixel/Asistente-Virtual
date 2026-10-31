import type { Metadata } from "next";
import { IgPagina } from "@/components/IgPagina";

export const metadata: Metadata = { title: "THREE3 · Enlaces", description: "Elige un servicio de THREE3 y pide tu cotización." };

export default function Ig() {
  return <IgPagina />;
}
