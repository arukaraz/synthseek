FROM node:22-alpine

RUN apk add --no-cache \
    libc6-compat \
    openssl \
    python3 \
    py3-pip \
    chromaprint \
    ffmpeg \
    wget \
    tini \
    shadow \
    su-exec

RUN pip3 install --break-system-packages --no-cache-dir \
    "beets==2.4.0" \
    requests \
    pylast \
    && beet version

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs synthseek \
    && mkdir -p /data/db /data/config /data/logs /data/artwork-cache /downloads /music \
    && chown -R synthseek:nodejs /data /data/artwork-cache /downloads /music

WORKDIR /app

COPY --chown=synthseek:nodejs server/ ./server/

COPY --chown=synthseek:nodejs web/standalone ./web/
COPY --chown=synthseek:nodejs web/static ./web/.next/static/
COPY --chown=synthseek:nodejs web/public ./web/public/

COPY --chown=synthseek:nodejs docker/start.sh ./start.sh
RUN chmod +x ./start.sh \
    && chmod -R 755 /app/web \
    && rm -f /app/web/.env 2>/dev/null || true


ENV NODE_ENV=production \
    PUID=1000 \
    PGID=1000 \
    API_HOST=0.0.0.0 \
    WEB_UI_PORT=4400 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/db/synthseek.db \
    DOWNLOADS_COMPLETE_PATH=/downloads \
    MUSIC_LIBRARY_PATH=/music \
    BEETS_CONFIG=/data/config/beets-config.yaml \
    ARTWORK_CACHE_PATH=/data/artwork-cache \
    NEXT_TELEMETRY_DISABLED=1


EXPOSE 4400 4401

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:4401/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./start.sh"]
