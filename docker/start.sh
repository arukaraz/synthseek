#!/bin/sh
set -e

echo ""
echo "Synthseek starting"
echo ""

PUID=${PUID:-1000}
PGID=${PGID:-1000}
API_PORT=4401
WEB_PORT=${WEB_UI_PORT:-4400}

DB_URL="${DATABASE_URL:-file:/data/db/synthseek.db}"
DB_PATH="${DB_URL#file:}"
DB_PATH="${DB_PATH%%\?*}"
BACKUP_DIR="/data/backups"
MIGRATE_LOG="/data/logs/migrate.log"
UPGRADE_DB="$(dirname "$DB_PATH")/synthseek.upgrade.db"
BACKUP_FILE=""

echo "  User:     PUID=${PUID}, PGID=${PGID}"
echo "  API:      port ${API_PORT}"
echo "  Web:      port ${WEB_PORT}"
echo "  Database: ${DB_URL}"
echo ""

has_pending_migrations() {
    su-exec synthseek sh -c "cd /app/server && PRISMA_HIDE_UPDATE_MESSAGE=1 PRISMA_HIDE_DEPRECATION_WARNING=1 npx prisma migrate status --schema=db/schema.prisma 2>/dev/null" | grep -q "have not yet been applied"
}

run_prisma_deploy() {
    su-exec synthseek sh -c "cd /app/server && DATABASE_URL='$1' PRISMA_HIDE_UPDATE_MESSAGE=1 PRISMA_HIDE_DEPRECATION_WARNING=1 npx prisma migrate deploy --schema=db/schema.prisma"
}

run_db_validation() {
    su-exec synthseek node /app/server/dist/scripts/validate-migrated-db.cjs "$1" /app/server/db/migrations
}

snapshot_database() {
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/pre-migration-$(date +%Y%m%d-%H%M%S).db"
    cp "$DB_PATH" "$BACKUP_FILE"
    if [ -f "$DB_PATH-wal" ]; then cp "$DB_PATH-wal" "$BACKUP_FILE-wal"; fi
    if [ -f "$DB_PATH-shm" ]; then cp "$DB_PATH-shm" "$BACKUP_FILE-shm"; fi
    chown synthseek:nodejs "$BACKUP_FILE" "$BACKUP_FILE-wal" "$BACKUP_FILE-shm" 2>/dev/null || true
    echo "      Pending migrations detected, snapshot saved to $BACKUP_FILE"
}

upgrade_guards_ok() {
    DB_SIZE=$(wc -c < "$DB_PATH")
    MIN_FREE="${UPGRADE_MIN_FREE_BYTES:-$((DB_SIZE * 2))}"
    FREE_KB=$(df -Pk "$(dirname "$DB_PATH")" | awk 'NR==2 {print $4}')
    FREE_BYTES=$((FREE_KB * 1024))
    if [ "$FREE_BYTES" -lt "$MIN_FREE" ]; then
        echo "      WARN Not enough free space for a copy-validated upgrade (${FREE_BYTES} bytes free, ${MIN_FREE} bytes needed)."
        echo "      WARN Falling back to an in-place migration. A snapshot was saved to $BACKUP_FILE."
        return 1
    fi
    case "$DB_PATH" in
        /data/db/*) return 0 ;;
    esac
    echo "      WARN Custom DATABASE_URL resolves outside /data/db ($DB_PATH), skipping the copy-validated upgrade."
    echo "      WARN Falling back to an in-place migration. A snapshot was saved to $BACKUP_FILE."
    return 1
}

prepare_upgrade_copy() {
    rm -f "$UPGRADE_DB" "$UPGRADE_DB-wal" "$UPGRADE_DB-shm"
    cp "$DB_PATH" "$UPGRADE_DB"
    if [ -f "$DB_PATH-wal" ]; then cp "$DB_PATH-wal" "$UPGRADE_DB-wal"; fi
    if [ -f "$DB_PATH-shm" ]; then cp "$DB_PATH-shm" "$UPGRADE_DB-shm"; fi
    chown synthseek:nodejs "$UPGRADE_DB" "$UPGRADE_DB-wal" "$UPGRADE_DB-shm" 2>/dev/null || true
}

run_migrate_with_log() {
    mkdir -p "$(dirname "$MIGRATE_LOG")"
    echo "==== migrate deploy $(date -u +%Y-%m-%dT%H:%M:%SZ) target=$1 ====" >> "$MIGRATE_LOG"
    MIGRATE_OUTPUT="$(mktemp)"
    MIGRATE_STATUS=0
    if ! run_prisma_deploy "$1" > "$MIGRATE_OUTPUT" 2>&1; then
        MIGRATE_STATUS=1
    fi
    cat "$MIGRATE_OUTPUT"
    cat "$MIGRATE_OUTPUT" >> "$MIGRATE_LOG"
    rm -f "$MIGRATE_OUTPUT"
    return $MIGRATE_STATUS
}

apply_validated_upgrade() {
    if ! run_migrate_with_log "file:$UPGRADE_DB"; then
        echo "      ERROR Migration failed on the upgrade copy, the live database was not modified."
        return 1
    fi
    if ! run_db_validation "$UPGRADE_DB"; then
        echo "      ERROR The migrated copy failed validation, the live database was not modified."
        return 1
    fi
    if [ -s "$UPGRADE_DB-wal" ]; then
        echo "      ERROR The upgrade copy has uncheckpointed WAL data, the live database was not modified."
        return 1
    fi
    if ! mv "$UPGRADE_DB" "$DB_PATH"; then
        echo "      ERROR Failed to swap the upgraded database into place."
        return 1
    fi
    rm -f "$DB_PATH-wal" "$DB_PATH-shm" "$UPGRADE_DB-wal" "$UPGRADE_DB-shm"
    echo "      Migration applied to a copy, validated, and swapped into place"
}

print_upgrade_failure() {
    echo ""
    echo "      Database upgrade failed. Last lines of $MIGRATE_LOG:"
    tail -n 20 "$MIGRATE_LOG" 2>/dev/null || true
    echo ""
    echo "      The live database at $DB_PATH was not modified."
    if [ -n "$BACKUP_FILE" ]; then
        echo "      A pre-upgrade snapshot is available at $BACKUP_FILE."
    fi
    echo "      The failed upgrade copy was kept at $UPGRADE_DB for inspection."
}

cleanup_old_snapshots() {
    for OLD in $(ls -1t "$BACKUP_DIR"/pre-migration-*.db 2>/dev/null | tail -n +11); do
        rm -f "$OLD" "$OLD-wal" "$OLD-shm"
    done
}

echo "[1/6] Setting up user permissions..."
groupmod -o -g "$PGID" nodejs 2>/dev/null || true
usermod -o -u "$PUID" -g "$PGID" synthseek 2>/dev/null || true
echo "      Done"

echo "[2/6] Creating directories..."
mkdir -p /data/db /data/config /data/logs /data/artwork-cache /downloads /music
chown -R synthseek:nodejs /data
mkdir -p /app/web/.next/cache
chown -R synthseek:nodejs /app/web/.next/cache
if ! su-exec synthseek test -w /downloads 2>/dev/null; then
    if su-exec synthseek test -r /downloads 2>/dev/null; then
        echo "      WARN /downloads: read-only for synthseek (PUID=$PUID). Downloads need write access, the app will fail to start. Fix host ownership: chown -R $PUID:$PGID <your downloads path>"
    else
        echo "      WARN /downloads: synthseek (PUID=$PUID) has no access. Set PUID/PGID to match host owner of /downloads, or remount with uid=$PUID,gid=$PGID."
    fi
fi
if ! su-exec synthseek test -w /music 2>/dev/null; then
    if su-exec synthseek test -r /music 2>/dev/null; then
        echo "      /music: read-only for synthseek (PUID=$PUID). Library will work read-only."
    else
        echo "      WARN /music: synthseek (PUID=$PUID) has no access. Set PUID/PGID to match host owner of /music, or remount with uid=$PUID,gid=$PGID."
    fi
fi
echo "      Done"

echo "[3/6] Loading configuration..."
if [ ! -f "/data/config/beets-config.yaml" ] && [ -f "/app/server/data/config/beets-config.yaml" ]; then
    cp /app/server/data/config/beets-config.yaml /data/config/
    chown synthseek:nodejs /data/config/beets-config.yaml
    echo "      Created default beets-config.yaml"
fi

if [ -f "/app/server/data/config/beets-config.yaml" ]; then
    cp /app/server/data/config/beets-config.yaml /data/config/beets-config.example.yaml
    chown synthseek:nodejs /data/config/beets-config.example.yaml
fi

echo "[4/6] Checking database migrations..."
UPGRADE_MODE="inplace"
if [ -f "$DB_PATH" ]; then
    if has_pending_migrations; then
        snapshot_database
        if upgrade_guards_ok; then
            UPGRADE_MODE="copy"
            prepare_upgrade_copy
        fi
    else
        echo "      No pending migrations"
    fi
else
    echo "      No existing database, fresh install"
fi

echo "[5/6] Preparing admin seed..."
cd /app/server
SEED_TARGET_URL="$DB_URL"
if [ "$UPGRADE_MODE" = "copy" ]; then
    SEED_TARGET_URL="file:$UPGRADE_DB"
fi
if ! DATABASE_URL="$SEED_TARGET_URL" su-exec synthseek node dist/scripts/prepare-admin-seed.cjs; then
    echo "      Aborting startup (see message above)."
    exit 1
fi

echo "[6/6] Running database migrations..."
if [ -f "db/schema.prisma" ]; then
    if [ "$UPGRADE_MODE" = "copy" ]; then
        if ! apply_validated_upgrade; then
            print_upgrade_failure
            exit 1
        fi
    else
        if ! run_migrate_with_log "$DB_URL"; then
            echo "      ERROR Database migration failed. Last lines of $MIGRATE_LOG:"
            tail -n 20 "$MIGRATE_LOG" 2>/dev/null || true
            if [ -n "$BACKUP_FILE" ]; then
                echo "      A pre-migration snapshot is available at $BACKUP_FILE."
            fi
            exit 1
        fi
        echo "      Done"
    fi
    cleanup_old_snapshots
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
