#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-start}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

case "$MODE" in
  start|run) exec pnpm start ;;
  --android|android) exec pnpm android ;;
  --ios|ios) exec pnpm ios ;;
  --web|web) exec pnpm web ;;
  --tunnel|tunnel) exec pnpm --dir ../.. exec expo start "$APP_DIR" --go --tunnel ;;
  --export|export) exec pnpm export ;;
  --doctor|doctor) exec pnpm doctor ;;
  --help|help)
    printf '%s\n' 'usage: ./script/build_and_run.sh [start|android|ios|web|tunnel|export|doctor|help]'
    ;;
  *) printf '%s\n' "Unknown mode: $MODE" >&2; exit 2 ;;
esac
