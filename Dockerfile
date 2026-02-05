FROM node:22-alpine

RUN apk add --no-cache \
    # Core runtime
    libc6-compat \
    openssl \
    # Python for beets
    python3 \
    py3-pip \
    # Audio fingerprinting (fpcalc for AcoustID)
    chromaprint \
    # Audio processing
    ffmpeg \
    # Utilities
    wget \
    # Init system for signal handling
    tini \
    # User management for PUID/PGID
    shadow \
    su-exec

# ─────────────────────────────────────────────────────────────────────────────
# INSTALL BEETS
# ─────────────────────────────────────────────────────────────────────────────
RUN pip3 install --break-system-packages --no-cache-dir \
    "beets==2.4.0" \
    requests \
    pylast \
    && beet version

# ─────────────────────────────────────────────────────────────────────────────
# CREATE USER AND DIRECTORIES
# ─────────────────────────────────────────────────────────────────────────────
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 synthseek \
    && mkdir -p /data/db /data/config /data/logs /downloads /music \
    && chown -R synthseek:nodejs /data /downloads /music

WORKDIR /app

# ─────────────────────────────────────────────────────────────────────────────
# COPY APPLICATION
# ─────────────────────────────────────────────────────────────────────────────
# Server
COPY --chown=synthseek:nodejs server/ ./server/

# Frontend
COPY --chown=synthseek:nodejs web/standalone ./web/
COPY --chown=synthseek:nodejs web/static ./web/.next/static/
COPY --chown=synthseek:nodejs web/public ./web/public/

# Startup script
COPY --chown=synthseek:nodejs docker/start.sh ./start.sh
RUN chmod +x ./start.sh

# ─────────────────────────────────────────────────────────────────────────────
# ENVIRONMENT
# ─────────────────────────────────────────────────────────────────────────────
ENV NODE_ENV=production \
    PUID=1000 \
    PGID=1000 \
    API_PORT=4401 \
    API_HOST=0.0.0.0 \
    PORT=4400 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/db/synthseek.db \
    DOWNLOADS_COMPLETE_PATH=/downloads \
    MUSIC_LIBRARY_PATH=/music \
    BEETS_CONFIG=/data/config/beets-config.yaml \
    BACKEND_URL=http://localhost:4401 \
    NEXT_TELEMETRY_DISABLED=1

# ─────────────────────────────────────────────────────────────────────────────
# RUNTIME
# ─────────────────────────────────────────────────────────────────────────────
EXPOSE 4400 4401

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:${API_PORT:-4401}/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./start.sh"]
