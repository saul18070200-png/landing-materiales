#!/usr/bin/env bash
# Regenera las fichas tecnicas en PDF a partir de los HTML de esta carpeta.
# Uso: bash assets/docs/src/generar-pdf.sh   (desde la raiz del proyecto)
#
# Los PDF anteriores se perdieron junto con su fuente y quedaron con el
# telefono viejo. Estos HTML son ahora la unica fuente de verdad: si cambia
# un dato de contacto o una especificacion, se edita aqui y se vuelve a correr.

set -euo pipefail

CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
[ -f "$CHROME" ] || CHROME="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
[ -f "$CHROME" ] || { echo "No se encontro Chrome ni Edge para imprimir a PDF."; exit 1; }

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$(cd "$SRC/.." && pwd)"

for f in vigueta bovedilla caseton; do
  echo "Imprimiendo ficha-$f ..."
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --no-pdf-header-footer \
    --print-to-pdf="$(cygpath -w "$OUT/ficha-tecnica-$f.pdf")" \
    "file:///$(cygpath -m "$SRC/ficha-$f.html")" 2>/dev/null
done

echo
echo "Listo. PDFs regenerados en $OUT"
ls -la "$OUT"/ficha-tecnica-*.pdf
