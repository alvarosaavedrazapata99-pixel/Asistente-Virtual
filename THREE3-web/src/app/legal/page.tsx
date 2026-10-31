import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Información legal · THREE3" };

const secciones = [
  ["Titular y datos del proveedor", "Razón social: [COMPLETAR]. RUC: [COMPLETAR]. Domicilio: [COMPLETAR]. Contacto: [COMPLETAR]."],
  ["Marca y derechos de autor", "THREE3, el logo árbol-circuito y el personaje Tri son obras y signos de su titular. Registro ante INDECOPI: [COMPLETAR]. Queda prohibida su reproducción sin autorización."],
  ["Protección de datos personales", "Tratamiento conforme a la Ley N.º 29733 y su reglamento. Finalidad, base legal, derechos ARCO, plazos, transferencias y seguridad: [COMPLETAR]."],
  ["Libro de Reclamaciones", "Conforme a la Ley N.º 32495 y al Código de Protección y Defensa del Consumidor. Acceso al Libro de Reclamaciones virtual: [COMPLETAR]."],
  ["Uso de inteligencia artificial", "Cuando un servicio sea operado con IA, se informará dentro de la conversación (Ley N.º 31814). Alcance y revisión humana: [COMPLETAR]."],
  ["Facturación", "Comprobantes de pago electrónicos conforme a SUNAT. Facturador autorizado: [COMPLETAR]."],
];

export default function Legal() {
  return (
    <main className="mx-auto max-w-3xl bg-night px-4 py-12">
      <Link href="/" className="text-sm text-cyan underline underline-offset-4">← Volver al inicio</Link>
      <h1 className="mt-6 font-display text-4xl uppercase">Información legal</h1>
      <p className="mt-2 text-sm text-cream/60">
        Borrador. Revisión obligatoria por un abogado y un contador antes de publicar. Cifras y normas por verificar con las fichas oficiales.
      </p>
      {secciones.map(([t, c], i) => (
        <section key={t} className="mt-8">
          <h2 className="text-xl font-bold">{i + 1}. {t}</h2>
          <p className="mt-2 leading-relaxed text-cream/85">{c}</p>
        </section>
      ))}
      <p className="mt-12 text-sm text-cream/60">© 2026 THREE3. Todos los derechos reservados.</p>
    </main>
  );
}
