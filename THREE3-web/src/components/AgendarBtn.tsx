import { enlaceWhatsApp } from "@/lib/planes";

/**
 * "Agendar diagnóstico": lleva a WhatsApp con un mensaje inicial.
 * Mientras no haya número en empresa.config.json, abre el formulario (con el servicio elegido).
 */
export function AgendarBtn({ className = "btn amb", texto = "Agendar diagnóstico", evento = "agendar", servicio = "diagnostico", corto }: { className?: string; texto?: string; evento?: string; servicio?: string; corto?: string }) {
  const wa = enlaceWhatsApp();
  const contenido = corto ? (
    <>
      <span className="lg">{texto}</span>
      <span className="sm">{corto}</span>
    </>
  ) : (
    texto
  );
  return wa ? (
    <a className={className} href={wa} target="_blank" rel="noopener noreferrer" data-ev={evento}>
      {contenido}
    </a>
  ) : (
    <a className={className} href="#final" data-activar={servicio} data-ev={evento}>
      {contenido}
    </a>
  );
}
