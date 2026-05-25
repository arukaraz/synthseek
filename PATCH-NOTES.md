# Patch Notes

---

# v1.2.1 — May 4, 2026

### Track failures now tell you why

When a track fails, the request card surfaces a typed failure reason
with an icon and tooltip instead of a generic error. Reasons are
classified into:

- **Not found** — no source matched the requested track.
- **Import rejected** — Beets / Plex declined the file (metadata,
  format, or duplicate).
- **P2P failed** — Soulseek peers errored out or never delivered.
- **Other** — fallback for unclassified failures.

The retry path bifurcates accordingly so retries do the right thing
for each kind of failure instead of blindly repeating the same
attempt. Each `TrackRequest` also stores the resolved `downloaded_file`
path for cleaner import diagnostics.

---

### Fixes and improvements

- Container no longer crashes at boot with `chown: /music: Operation
  not permitted` when the music library lives on a USB / exFAT / NTFS
  drive. The recursive `chown` on user volumes is replaced by a
  runtime access probe that emits a clear diagnostic instead of
  crashing. Boot is also instant on multi-TB libraries since there's
  no inode traversal, and the host's file ownership is no longer
  mutated by the container
  ([#2](https://github.com/arukaraz/synthseek/issues/2)).
- Malformed ISRC tags no longer break post-download metadata
  validation — they're ignored instead.
- Music cache warmup runs every 6 hours instead of every 25 minutes,
  reducing background load.
- Track count is hidden in the artist album list when unavailable
  instead of showing a placeholder.
- The sort filter is dropped from playlist navigation after submitting
  a request so you land on the freshly-added item.
- Date sort is inverted so the newest items appear first.

---

# v1.2.0 — April 19, 2026

> [!IMPORTANT]
> Two files are worth re-checking when you upgrade.
>
> **`config.yml`** has new sections in this release. After deploying,
> check the refreshed `config.example.yml` sitting next to your
> `config.yml` — diff them side-by-side and copy over the new flags
> you want. Your existing `config.yml` is left untouched on upgrade.
>
> **`docker-compose.yml`** no longer needs the `SPOTIFY_CLIENT_ID` /
> `SPOTIFY_CLIENT_SECRET` env vars (Deezer needs no auth) and adds
> optional enrichment knobs (`LASTFM_API_KEY`, `FANART_API_KEY`,
> `MUSICBRAINZ_CONTACT_EMAIL`). Stale Spotify vars are harmless but
> can be removed. The enrichment keys are strongly encouraged even
> though they're optional, they unlock higher-quality artist images,
> album art, discovery, and metadata throughout the app, and the APIs
> are free to register.

> [!WARNING]
> **Back up `db/`** before upgrading. This release ships a schema
> change and it's good hygiene to snapshot your SQLite file in case
> you need to roll back.

### Provider agnostic update (and more)

Completed the migration off Spotify's restricted API and rebuilt the
music metadata layer around a provider-agnostic facade. Deezer is the
default adapter today — no authentication required, no rate-limit
surprises, no Premium gatekeeping. The facade exposes the same shape
(tracks / albums / artists / playlists / genres) regardless of the
underlying provider, so future providers can be added without touching
the UI or the download pipeline.

Content search now runs a smart multi-layer intent classifier (genre rules →
learned patterns → post-search heuristics) to route ambiguous queries
like "workout energy" or "chill sunday" to genre or mood endpoints
instead of plain text search, surfacing better results for natural-
language queries.
This can be disabled in the `config.yml` file to fall back to legacy search.

A support to integrate an LLM-assisted classifier is also in the works as a final fallback for
queries the rule-based layers can't resolve on their own, with adapters
for Ollama (local), OpenAI, Anthropic, and Groq already scaffolded in
the codebase. The feature is parked as **Work in progress**.

---

### Playlist Downloads End-to-End - Plex

You can now request a full playlist from search or discover — Synthseek
will download every track individually, preserve the original ordering,
and reconstruct the playlist inside Plex when the download finishes. If
some tracks resolve late (retries, slow peers), the Plex playlist is
synced incrementally as each new track arrives instead of waiting for
all of them.

A new playlist status badge shows where each playlist is in its life
cycle — **Syncing to Plex…** while the reconstruction is in flight,
then **In Plex ✓** or **Not in Plex** with a retry button if the Plex
side failed. The status is a first-class value in the canonical request
state, so the card visuals (border, gradient, description) transition
naturally without a flash of "partially complete" before the sync
finishes.

I am also working on a workflow to import existing playlists from
multiple music providers directly into Synthseek so you can mirror your current
libraries without having to rebuild them by hand. Parked as **Work in
progress**.

---

### Plex Integration Update

Plex actions are now each individually controllable from `config.yml`:
`library_scan` (toggles the post-import library refresh) and
`playlist_sync` (toggles playlist creation and incremental sync). Both
default to on. After metadata enforcement, the Plex library is now
rescanned with `force=1` so newly tagged files show up immediately.

---

### Minor fixes and improvements

Various small bug fixes, UX polish, and performance tweaks across
search, the request list, and the download pipeline.

---

# v1.1.0 — March 26, 2026

### Spotify API Migration (Feb 2026 Breaking Changes)

Adapted to Spotify's February 2026 API restrictions that require Premium
accounts for API access and impose stricter rate limits. Search and album
track limits reduced to 10, trending tracks rewritten to use direct search
instead of playlist endpoints (now requiring user OAuth), and browse
categories replaced with a static genre list.

Currently working on a more reliable metadata provider integration

Reference: https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security

---

### Version Update Notifications

Added automatic detection of new releases published to GitHub Container Registry.
A dismissable ribbon banner appears at the top of the page when a newer version is available.
