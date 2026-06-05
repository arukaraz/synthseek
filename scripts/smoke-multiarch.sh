#!/usr/bin/env bash
#
# smoke-multiarch.sh
#
# WHAT: Validates that the Dockerfile `server-deps` stage produces ARCH-CORRECT
#       native dependencies (better-sqlite3 addon + Prisma query engine) for a
#       target platform, without GitHub Actions and without the obfuscated
#       server bundle.
# WHY:  The arm64 image once shipped x64 native binaries and crashed on real
#       ARM. This script proves binary correctness per-arch locally. The dev
#       host is x86_64, so arm64 is exercised under QEMU emulation, which is
#       enough to prove the addon loads and the engine resolves for that arch.
#
# MODES:
#   focused (default): builds ONLY the `server-deps` stage from a minimal
#     synthetic context (server package manifests + db/), then runs a runtime
#     assertion. Reliable and reasonably fast (arm64 under QEMU is slow but
#     bounded).
#   full: builds the ENTIRE image for the platform and hits /api/health to
#     assert runtime.arch. Requires a fully assembled ./docker-context (server
#     bundle + `next build` standalone output) which this script does NOT
#     produce. Best-effort, very slow under emulation. Focused is the default.
#
# USAGE:
#   web/scripts/smoke-multiarch.sh                          # focused, linux/arm64
#   PLATFORM=linux/amd64 web/scripts/smoke-multiarch.sh     # focused, native control
#   web/scripts/smoke-multiarch.sh -p linux/arm64 -t my:tag
#   MODE=full CONTEXT=./docker-context web/scripts/smoke-multiarch.sh -p linux/arm64
#
# FLAGS (override env):
#   -p PLATFORM   target platform (default linux/arm64)
#   -m MODE       focused | full (default focused)
#   -t TAG        image tag (default synthseek-smoke:<arch>)
#   -c CONTEXT    full-mode build context (default ./docker-context)
#   -h            help

set -euo pipefail

PLATFORM="${PLATFORM:-linux/arm64}"
MODE="${MODE:-focused}"
TAG="${TAG:-}"
CONTEXT="${CONTEXT:-./docker-context}"

while getopts "p:m:t:c:h" opt; do
  case "$opt" in
    p) PLATFORM="$OPTARG" ;;
    m) MODE="$OPTARG" ;;
    t) TAG="$OPTARG" ;;
    c) CONTEXT="$OPTARG" ;;
    h)
      # Print only the contiguous header comment block (stop at the shebang and
      # at the first non-comment line).
      awk 'NR>1 && /^#/ { sub(/^# ?/, ""); print; next } NR>1 { exit }' "$0"
      exit 0
      ;;
    *)
      echo "FAIL: unknown flag, run with -h for usage" >&2
      exit 2
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$(cd "$WEB_DIR/../server" 2>/dev/null && pwd || true)"

CTX_DIR=""
FULL_CONTAINER=""

# Single top-level cleanup so the temp context and any full-mode container are
# removed on any exit path. Vars are script-global to stay defined under set -u.
cleanup() {
  [ -n "$CTX_DIR" ] && rm -rf "$CTX_DIR"
  [ -n "$FULL_CONTAINER" ] && docker rm -f "$FULL_CONTAINER" >/dev/null 2>&1
  return 0
}
trap cleanup EXIT

log() { printf '\n=== %s ===\n' "$1"; }
fail() {
  echo "SMOKE FAIL: $1" >&2
  exit 1
}

# Map a buildx platform string to the Node process.arch it must report.
expected_arch_for_platform() {
  case "$1" in
    linux/arm64 | linux/arm64/v8) echo "arm64" ;;
    linux/amd64 | linux/x86_64) echo "x64" ;;
    linux/arm/v7 | linux/arm) echo "arm" ;;
    *) echo "" ;;
  esac
}

# Map a buildx platform string to the binfmt arch token used for emulator install.
binfmt_arch_for_platform() {
  case "$1" in
    linux/arm64 | linux/arm64/v8) echo "arm64" ;;
    linux/amd64 | linux/x86_64) echo "amd64" ;;
    linux/arm/v7 | linux/arm) echo "arm" ;;
    *) echo "" ;;
  esac
}

HOST_ARCH="$(uname -m)"
EXPECTED_ARCH="$(expected_arch_for_platform "$PLATFORM")"
[ -n "$EXPECTED_ARCH" ] || fail "unsupported PLATFORM '$PLATFORM'"

if [ -z "$TAG" ]; then
  TAG="synthseek-smoke:${EXPECTED_ARCH}"
fi

log "configuration"
echo "PLATFORM        $PLATFORM"
echo "MODE            $MODE"
echo "TAG             $TAG"
echo "expected arch   $EXPECTED_ARCH"
echo "host arch       $HOST_ARCH"
echo "web dir         $WEB_DIR"
echo "server dir      ${SERVER_DIR:-<not found>}"

command -v docker >/dev/null 2>&1 || fail "docker not found on PATH"
docker buildx version >/dev/null 2>&1 || fail "docker buildx not available"

# Enable cross-arch emulation idempotently. binfmt registration is a privileged,
# host-level change, so detect-before-install keeps re-runs clean and quiet.
ensure_emulation() {
  local plat="$1"
  if [ "$HOST_ARCH" = "x86_64" ] && { [ "$plat" = "linux/amd64" ] || [ "$plat" = "linux/x86_64" ]; }; then
    return 0
  fi
  if [ "$HOST_ARCH" = "aarch64" ] && { [ "$plat" = "linux/arm64" ] || [ "$plat" = "linux/arm64/v8" ]; }; then
    return 0
  fi
  if docker buildx ls 2>/dev/null | grep -q "$plat"; then
    echo "emulation for $plat already available to buildx, skipping binfmt install"
    return 0
  fi
  local binfmt_arch
  binfmt_arch="$(binfmt_arch_for_platform "$plat")"
  [ -n "$binfmt_arch" ] || fail "cannot map '$plat' to a binfmt arch token"
  echo "NOTE: installing QEMU emulation for '$binfmt_arch'."
  echo "NOTE: this is a PRIVILEGED, HOST-LEVEL step (registers binfmt_misc handlers system-wide)."
  docker run --privileged --rm tonistiigi/binfmt --install "$binfmt_arch" >/dev/null
  echo "emulation installed for $binfmt_arch"
}

run_focused() {
  [ -n "$SERVER_DIR" ] || fail "server repo not found at '$WEB_DIR/../server' (focused mode needs server/package.json, package-lock.json, db/)"
  for f in package.json package-lock.json; do
    [ -f "$SERVER_DIR/$f" ] || fail "missing $SERVER_DIR/$f"
  done
  [ -d "$SERVER_DIR/db" ] || fail "missing $SERVER_DIR/db directory"

  CTX_DIR="$(mktemp -d -t synthseek-smoke-ctx.XXXXXX)"

  log "assembling minimal build context"
  mkdir -p "$CTX_DIR/server"
  cp "$SERVER_DIR/package.json" "$CTX_DIR/server/package.json"
  cp "$SERVER_DIR/package-lock.json" "$CTX_DIR/server/package-lock.json"
  cp -R "$SERVER_DIR/db" "$CTX_DIR/server/db"
  echo "context $CTX_DIR"
  echo "context contents:"
  ( cd "$CTX_DIR" && find server -maxdepth 2 -type f | sort | head -40 )

  ensure_emulation "$PLATFORM"

  log "building server-deps stage for $PLATFORM (arm64 under QEMU compiles better-sqlite3 + downloads engine, this is slow)"
  docker buildx build \
    -f "$WEB_DIR/Dockerfile" \
    --target server-deps \
    --platform "$PLATFORM" \
    -t "$TAG" \
    --load \
    "$CTX_DIR"

  # The alpine (musl) Prisma engine filename for the target arch. x64 musl has no
  # arch token, arm64 musl carries `-arm64`.
  local expected_engine
  case "$EXPECTED_ARCH" in
    x64) expected_engine="libquery_engine-linux-musl-openssl-3.0.x.so.node" ;;
    arm64) expected_engine="libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node" ;;
    *) expected_engine="" ;;
  esac

  log "runtime assertion ($PLATFORM)"
  # The node check runs INSIDE the target-arch image. It loads the native
  # better-sqlite3 addon, asserts process.arch, and requires the arch-matching
  # Prisma engine. EXPECTED_ARCH / EXPECTED_ENGINE are passed explicitly because
  # docker run does not inherit host env.
  docker run --rm --platform "$PLATFORM" \
    -e EXPECTED_ARCH="$EXPECTED_ARCH" \
    -e EXPECTED_ENGINE="$expected_engine" \
    "$TAG" node -e '
    const expected = process.env.EXPECTED_ARCH;
    const expectedEngine = process.env.EXPECTED_ENGINE;
    const fs = require("fs");
    const path = require("path");

    console.log("process.arch:", process.arch);
    if (process.arch !== expected) {
      console.error("ARCH MISMATCH: process.arch=" + process.arch + " expected=" + expected);
      process.exit(3);
    }

    const Database = require("better-sqlite3");
    const db = new Database(":memory:");
    const row = db.prepare("select 1 as ok").get();
    console.log("better-sqlite3 select 1 ->", JSON.stringify(row));
    if (!row || row.ok !== 1) {
      console.error("better-sqlite3 select 1 did not return ok=1");
      process.exit(4);
    }
    db.close();

    const clientDir = path.resolve("/build/node_modules/.prisma/client");
    if (!fs.existsSync(clientDir)) {
      console.error("prisma client dir not found at " + clientDir);
      process.exit(5);
    }
    const engines = fs.readdirSync(clientDir).filter(function (f) {
      return /query[_-]engine/.test(f) || /libquery_engine/.test(f);
    });
    if (engines.length === 0) {
      console.error("no prisma query engine binary found under " + clientDir);
      console.error("dir listing: " + fs.readdirSync(clientDir).join(", "));
      process.exit(6);
    }
    console.log("prisma query engine(s) present:", engines.join(", "));
    if (expectedEngine && !engines.includes(expectedEngine)) {
      console.error("missing arch-matching Prisma engine: " + expectedEngine);
      process.exit(7);
    }
    console.log("arch-matching Prisma engine:", expectedEngine || "(none expected)");
    console.log("RUNTIME CHECK OK");
  '
}

# best-effort: builds the whole image and probes /api/health for runtime.arch.
run_full() {
  echo "NOTE: full mode builds the ENTIRE image under emulation and is SLOW."
  echo "NOTE: it needs a fully assembled context at '$CONTEXT' (server bundle + next build standalone)."
  [ -d "$CONTEXT" ] || fail "full mode context '$CONTEXT' not found (assemble server/dist + web/standalone + web/static first)"
  [ -f "$CONTEXT/web/Dockerfile" ] || [ -f "$WEB_DIR/Dockerfile" ] || fail "Dockerfile not found"

  ensure_emulation "$PLATFORM"

  log "building full image for $PLATFORM"
  docker buildx build \
    -f "$WEB_DIR/Dockerfile" \
    --platform "$PLATFORM" \
    -t "$TAG" \
    --load \
    "$CONTEXT"

  FULL_CONTAINER="synthseek-smoke-full-$$"
  log "starting container and probing /api/health"
  docker run -d --rm --name "$FULL_CONTAINER" --platform "$PLATFORM" -p 4401 "$TAG" >/dev/null

  local hostport
  hostport="$(docker port "$FULL_CONTAINER" 4401/tcp | head -1 | sed 's/.*://')"
  [ -n "$hostport" ] || fail "could not resolve mapped health port"

  local arch=""
  local attempt=0
  while [ "$attempt" -lt 60 ]; do
    attempt=$((attempt + 1))
    if body="$(curl -fsS "http://localhost:${hostport}/api/health" 2>/dev/null)"; then
      echo "$body"
      arch="$(printf '%s' "$body" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).runtime.arch||"")}catch{console.log("")}})')"
      [ -n "$arch" ] && break
    fi
    sleep 2
  done

  [ -n "$arch" ] || fail "health endpoint never reported runtime.arch"
  echo "runtime.arch reported: $arch"
  [ "$arch" = "$EXPECTED_ARCH" ] || fail "runtime.arch=$arch expected=$EXPECTED_ARCH"
}

START_TS="$(date +%s)"
case "$MODE" in
  focused) run_focused ;;
  full) run_full ;;
  *) fail "unknown MODE '$MODE' (use focused or full)" ;;
esac
END_TS="$(date +%s)"

log "result"
echo "elapsed: $((END_TS - START_TS))s"
echo "SMOKE PASS: $PLATFORM ($EXPECTED_ARCH) in $MODE mode"
