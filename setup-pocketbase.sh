#!/usr/bin/env bash

set -euo pipefail

PB_VERSION="${PB_VERSION:-0.40.6}"
cd "$(dirname "$0")"

# 1. Work out which PocketBase build this computer needs
case "$(uname -s)" in
  Linux)  OS="linux" ;;
  Darwin) OS="darwin" ;;
  *) echo "Unsupported OS. On Windows, download pocketbase_${PB_VERSION}_windows_amd64.zip"
     echo "from https://github.com/pocketbase/pocketbase/releases and unzip it here."
     exit 1 ;;
esac

case "$(uname -m)" in
  x86_64|amd64)  ARCH="amd64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Unsupported CPU architecture: $(uname -m)"; exit 1 ;;
esac

# 2. Download and unzip PocketBase (skipped if it is already here)
if [ -x ./pocketbase ]; then
  echo "PocketBase is already installed: $(./pocketbase --version)"
else
  ZIP="pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
  URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${ZIP}"
  echo "Downloading ${URL}"
  curl -fL -o "$ZIP" "$URL"
  unzip -o "$ZIP" pocketbase
  rm "$ZIP"
  chmod +x ./pocketbase
  echo "Installed: $(./pocketbase --version)"
fi

# 3. Create (or update) the superuser from .env.local
if [ -f .env.local ]; then
  EMAIL="$(grep -E '^POCKETBASE_SUPERUSER_EMAIL=' .env.local | cut -d= -f2- | tr -d '\r')"
  PASSWORD="$(grep -E '^POCKETBASE_SUPERUSER_PASSWORD=' .env.local | cut -d= -f2- | tr -d '\r')"
  if [ -n "$EMAIL" ] && [ -n "$PASSWORD" ]; then
    ./pocketbase superuser upsert "$EMAIL" "$PASSWORD"
  else
    echo "POCKETBASE_SUPERUSER_EMAIL / POCKETBASE_SUPERUSER_PASSWORD missing in .env.local."
  fi
else
  echo "No .env.local found: copy .env.example to .env.local, fill it in and run this again"
  echo "to create the superuser (or create it in the admin console at /_/)."
fi

echo
echo "Done. Start the database with:  ./pocketbase serve"
echo "Admin console:                  http://127.0.0.1:8090/_/"
