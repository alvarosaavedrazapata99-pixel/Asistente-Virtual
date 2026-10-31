# Ver la web como usuario (versión de prueba, sin dominio)

La web se publica en una dirección gratis de Vercel (por ejemplo `three3-web.vercel.app`). Es la forma real de verla: sin barras de Claude ni de edición, igual que la verá un cliente.

## Pasos (los haces tú, unos 5 minutos)
1. Entra a **vercel.com** → *Sign up* con tu cuenta de GitHub.
2. **Add New → Project** → elige el repositorio `Asistente-Virtual` (autoriza el acceso si lo pide).
3. En *Configure Project*:
   - **Branch:** `three3-web-carga`
   - **Root Directory:** `THREE3-web`
   - **Framework Preset:** Next.js (lo detecta solo)
4. Pulsa **Deploy**. En 1–2 minutos te da la dirección.
5. Ábrela en tu celular y en tu laptop. Cada vez que yo suba un cambio a la rama, Vercel actualiza la dirección sola.

## Variables (se agregan después, en *Settings → Environment Variables*)
| Variable | Valor | Para qué |
|---|---|---|
| `NEXT_PUBLIC_LEADS_ENDPOINT` | URL `/exec` del Apps Script | Que el formulario envíe al Sheet (ver `docs/sheets/README.md`) |
| `NEXT_PUBLIC_NOINDEX` | `0` | **Solo al lanzar**: permite que Google la indexe |

Mientras no definas `NEXT_PUBLIC_NOINDEX=0`, la web lleva `noindex, nofollow`: no aparece en Google.

## Dominio propio
Cuando compres el dominio: Vercel → *Settings → Domains* → agrégalo y copia en tu registrador los registros DNS que indique.

## Alternativa sin Vercel
Cloudflare Pages: conecta el mismo repo, rama `three3-web-carga`, directorio raíz `THREE3-web`, comando `npm run build`, directorio de salida `out`.
