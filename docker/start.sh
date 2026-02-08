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
usermod -o -u "$PUID" synthseek 2>/dev/null || true
echo "      Done"

echo "[2/5] Creating directories..."
mkdir -p /data/db /data/config /data/logs /downloads /music
chown -R synthseek:nodejs /data /app /downloads /music
echo "      Done"

echo "[3/5] Loading configuration..."
if [ ! -f "/data/config/config.yml" ] && [ -f "/app/server/data/config/config.yml" ]; then
    cp /app/server/data/config/config.yml /data/config/
    chown synthseek:nodejs /data/config/config.yml
    echo "      Created default config.yml"
else
    echo "      Using existing config.yml"
fi

if [ ! -f "/data/config/beets-config.yaml" ] && [ -f "/app/server/data/config/beets-config.yaml" ]; then
    cp /app/server/data/config/beets-config.yaml /data/config/
    chown synthseek:nodejs /data/config/beets-config.yaml
    echo "      Created default beets-config.yaml"
fi

echo "[4/5] Running database migrations..."
cd /app/server
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

echo "[5/5] Starting services..."

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
