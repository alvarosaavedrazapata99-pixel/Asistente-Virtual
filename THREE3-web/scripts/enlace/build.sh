#!/usr/bin/env bash
# Reconstruye la versión estática que se publica en el enlace de revisión (carpeta .enlace/).
set -euo pipefail
cd "$(dirname "$0")/../.."
rm -rf out .next
npm run build
python3 -I scripts/enlace/make.py
echo "Listo: .enlace/index.html (+ legal.html, assets/, videos/). Publicar con la herramienta Artifact."
