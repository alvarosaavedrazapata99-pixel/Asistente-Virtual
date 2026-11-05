/**
 * Botón principal: lleva al diagnóstico automático gratis (/diagnostico). Allí el visitante responde unas preguntas
 * de su rubro, ve su resultado al instante y deja sus datos para recibirlo y para que THREE3 lo contacte.
 */
export function AgendarBtn({ className = "btn amb", texto = "Hacer mi diagnóstico gratis", evento = "diagnostico", corto, rubro }: { className?: string; texto?: string; evento?: string; servicio?: string; corto?: string; rubro?: string }) {
  const contenido = corto ? (
    <>
      <span className="lg">{texto}</span>
      <span className="sm">{corto}</span>
    </>
  ) : (
    texto
  );
  return (
    <a className={className} href={rubro ? `/diagnostico?r=${encodeURIComponent(rubro)}` : "/diagnostico"} data-ev={evento}>
      {contenido}
    </a>
  );
}
