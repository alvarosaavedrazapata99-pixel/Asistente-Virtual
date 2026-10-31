import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IgPagina } from "@/components/IgPagina";
import ig from "@/config/ig.config.json";

export const dynamicParams = false;

export function generateStaticParams() {
  return ig.campanas.map((c) => ({ campana: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ campana: string }> }): Promise<Metadata> {
  const { campana } = await params;
  const c = ig.campanas.find((x) => x.slug === campana);
  return { title: "THREE3 · Enlaces", description: c?.titulo ?? "Pide tu cotización." };
}

export default async function IgCampana({ params }: { params: Promise<{ campana: string }> }) {
  const { campana } = await params;
  const c = ig.campanas.find((x) => x.slug === campana);
  if (!c) notFound();
  return <IgPagina campana={c} />;
}
