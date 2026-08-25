#!/usr/bin/env bash
# Regenera assets/logo.png a partir de assets/logo-src/logo.html
# Uso: bash assets/logo-src/generar-logo.sh   (desde la raiz del proyecto)
#
# Contexto: el logo original (assets/logo-materiales-mp.png) decia "MATERIALES MP",
# nombre anterior de la marca. El commit 1e50bea unifico la marca a "Prefabricados MP"
# pero solo corrigio el alt del HTML, no la imagen. Este script reusa el icono
# original intacto y solo rasteriza la palabra nueva.

set -euo pipefail

CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
[ -f "$CHROME" ] || CHROME="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
[ -f "$CHROME" ] || { echo "No se encontro Chrome ni Edge."; exit 1; }

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$(cd "$SRC/.." && pwd)/logo.png"
PUERTO=8099

# Chrome necesita http:// para que la fuente de Google cargue; file:// la bloquea.
python -m http.server "$PUERTO" --directory "$(cd "$SRC/../.." && pwd)" >/dev/null 2>&1 &
SERVIDOR=$!
trap 'kill $SERVIDOR 2>/dev/null || true' EXIT
sleep 2

"$CHROME" \
  --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 \
  --default-background-color=00000000 \
  --window-size=361,180 \
  --virtual-time-budget=6000 \
  --screenshot="$(cygpath -w "$OUT")" \
  "http://localhost:$PUERTO/assets/logo-src/logo.html" 2>/dev/null

echo "Logo regenerado en $OUT"
ls -la "$OUT"
