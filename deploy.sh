#!/usr/bin/env bash

# ═════════════════════════════════════════════════════════════════════
# Elmira Davet - Tek Tıklama Production Build & Deploy Betiği
# ═════════════════════════════════════════════════════════════════════

set -e

# Proje kök dizinine geç
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Elmira Davet Dağıtım İşlemi Başlatılıyor..."

# .env.deploy kontrolü
if [ ! -f ".env.deploy" ]; then
  if [ -f ".env.deploy.example" ]; then
    echo "⚠️  '.env.deploy' dosyası bulunamadı."
    echo "📋 '.env.deploy.example' dosyasından '.env.deploy' oluşturuluyor..."
    cp .env.deploy.example .env.deploy
    echo "❗ Lütfen '.env.deploy' dosyasını açıp Natro FTP şifrenizi girin, ardından bu scripti tekrar çalıştırın."
    exit 1
  fi
fi

# Node.js deploy motorunu çalıştır
node scripts/deploy.mjs "$@"
