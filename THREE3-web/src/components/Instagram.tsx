import { INSTAGRAM_URL } from "@/lib/services";
import { LoopVideo } from "./LoopVideo";
import { Reveal } from "./Reveal";

export function Instagram() {
  return (
    <section id="instagram">
      <div className="w">
        <Reveal className="sh">
          <div>
            <span className="mono">Síguenos</span>
            <h2 style={{ marginTop: 10 }}>Todo empieza en @three_3agency</h2>
          </div>
          <p>Mira cómo trabajamos y escríbenos por mensaje directo.</p>
        </Reveal>
        <Reveal className="vid-banner">
          <LoopVideo base="/videos/sec_instagram" poster="/videos/posters/sec_instagram.webp" label="Animación: un comentario en Instagram termina como cliente registrado en tu CRM" />
        </Reveal>
        <div className="cta-centro" style={{ marginTop: 8 }}>
          <a className="btn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Abrir Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
