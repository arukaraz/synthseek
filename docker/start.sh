#!/bin/sh
set -e

echo ""
echo "Synthseek starting"
echo ""

PUID=${PUID:-1000}
PGID=${PGID:-1000}
API_PORT=4401
WEB_PORT=${WEB_UI_PORT:-4400}

echo "  User:     PUID=${PUID}, PGID=${PGID}"
echo "  API:      port ${API_PORT}"
echo "  Web:      port ${WEB_PORT}"
echo "  Database: ${DATABASE_URL:-file:/data/db/synthseek.db}"
echo ""

echo "[1/5] Setting up user permissions..."
groupmod -o -g "$PGID" nodejs 2>/dev/null || true
usermod -o -u "$PUID" -g "$PGID" synthseek 2>/dev/null || true
echo "      Done"

echo "[2/5] Creating directories..."
mkdir -p /data/db /data/config /data/logs /data/artwork-cache /downloads /music
chown -R synthseek:nodejs /data
for dir in /downloads /music; do
    if su-exec synthseek test -w "$dir" 2>/dev/null; then
        continue
    fi
    if su-exec synthseek test -r "$dir" 2>/dev/null; then
        echo "      $dir: read-only for synthseek (PUID=$PUID). Library will work read-only."
    else
        echo "      WARN $dir: synthseek (PUID=$PUID) has no access. Set PUID/PGID to match host owner of $dir, or remount with uid=$PUID,gid=$PGID."
    fi
done
echo "      Done"

echo "[3/5] Loading configuration..."
if [ ! -f "/data/config/beets-config.yaml" ] && [ -f "/app/server/data/config/beets-config.yaml" ]; then
    cp /app/server/data/config/beets-config.yaml /data/config/
    chown synthseek:nodejs /data/config/beets-config.yaml
    echo "      Created default beets-config.yaml"
fi

if [ -f "/app/server/data/config/beets-config.yaml" ]; then
    cp /app/server/data/config/beets-config.yaml /data/config/beets-config.example.yaml
    chown synthseek:nodejs /data/config/beets-config.example.yaml
fi

echo "[4/6] Backing up database..."
if [ -f "/data/db/synthseek.db" ]; then
    mkdir -p /data/backups
    BACKUP_FILE="/data/backups/pre-migration-$(date +%Y%m%d-%H%M%S).db"
    cp /data/db/synthseek.db "$BACKUP_FILE"
    chown synthseek:nodejs "$BACKUP_FILE"
    echo "      Snapshot saved to $BACKUP_FILE"
else
    echo "      No existing database — skipping backup"
fi

echo "[5/6] Preparing admin seed (if migration env vars present)..."
cd /app/server
if [ -n "${ADMIN_MIGRATION_EMAIL:-}" ] && [ -n "${ADMIN_MIGRATION_USERNAME:-}" ] && [ -n "${ADMIN_MIGRATION_PASSWORD:-}" ]; then
    su-exec synthseek node dist/scripts/prepare-admin-seed.cjs
    SEED_EXIT=$?
    if [ $SEED_EXIT -ne 0 ]; then
        echo "      prepare-admin-seed failed (exit $SEED_EXIT). Aborting startup."
        exit $SEED_EXIT
    fi
else
    echo "      No ADMIN_MIGRATION_* env vars — setup wizard path"
fi

echo "[6/6] Running database migrations..."
if [ -f "db/schema.prisma" ]; then
    PRISMA_HIDE_UPDATE_MESSAGE=1 PRISMA_HIDE_DEPRECATION_WARNING=1 su-exec synthseek npx prisma migrate deploy --schema=db/schema.prisma 2>/dev/null
    echo "      Done"
else
    echo "      Skipped (schema not found)"
fi

shutdown() {
    echo ""
    echo "Shutting down..."
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    kill -TERM "$WEB_PID" 2>/dev/null || true
    wait
    echo "Stopped"
    exit 0
}

trap shutdown SIGTERM SIGINT

echo "Starting services..."

cd /app/server
su-exec synthseek node dist/index.cjs &
SERVER_PID=$!

MAX_WAIT=120
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if wget -q --spider "http://localhost:${API_PORT}/api/health" 2>/dev/null; then
        break
    fi
    sleep 1
    WAITED=$((WAITED + 1))
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo "      Server failed to start (timeout)"
    exit 1
fi

cd /app/web
su-exec synthseek sh -c "cd /app/web && HOSTNAME=0.0.0.0 PORT=$WEB_PORT node server.js" >/dev/null &
WEB_PID=$!

sleep 2
if ! kill -0 "$WEB_PID" 2>/dev/null; then
    echo "      UI failed to start"
    exit 1
fi

echo ""
echo "Synthseek ready"
echo ""

wait -n

exit_code=$?

shutdown

exit $exit_code
