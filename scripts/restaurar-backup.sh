#!/usr/bin/env bash
# Restaura un backup cifrado descargado desde GitHub Releases
# (github.com/aldeiaagency/black-series-market/releases).
#
# ADVERTENCIA: pg_restore con --clean sobrescribe la base de datos de destino.
# No apuntar nunca a producción sin estar seguro de qué se está haciendo.
#
# Requiere: Docker Desktop en marcha. No requiere instalar PostgreSQL en local.
#
# Uso:
#   ./scripts/restaurar-backup.sh blm-full-2026-08-29.dump.gz.enc "postgresql://postgres:...@db.xxx.supabase.co:5432/postgres"

set -euo pipefail

ENC_FILE="${1:?Uso: restaurar-backup.sh <archivo.dump.gz.enc> <SUPABASE_DB_URL_destino>}"
TARGET_DB_URL="${2:?Falta la URL de conexión de destino}"

GZ_FILE="${ENC_FILE%.enc}"
DUMP_FILE="${GZ_FILE%.gz}"

read -rsp "Passphrase del backup (la generada al montar el sistema, guardada en el gestor de contraseñas): " PASSPHRASE
echo

echo "Descifrando..."
openssl enc -d -aes-256-cbc -pbkdf2 -in "$ENC_FILE" -out "$GZ_FILE" -pass "pass:$PASSPHRASE"

echo "Descomprimiendo..."
gunzip -k "$GZ_FILE"

echo ""
echo "Vas a restaurar sobre:"
echo "  $TARGET_DB_URL"
read -rp "Escribe RESTAURAR para confirmar: " CONFIRM
if [ "$CONFIRM" != "RESTAURAR" ]; then
  echo "Cancelado."
  exit 1
fi

docker run --rm -v "$PWD":/backup postgres:17 \
  pg_restore --no-owner --no-privileges --clean --if-exists \
  -d "$TARGET_DB_URL" "/backup/$(basename "$DUMP_FILE")"

echo ""
echo "Restauración completa."
echo "Recuerda: las fotos de Storage no están en este backup — solo su metadata."
