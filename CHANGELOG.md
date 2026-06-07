# Patch Notes

---

# v2.0.0 — June 5, 2026

> [!IMPORTANT]
> Synthseek is now multi-user. On first launch you create an admin account through a new setup wizard, and existing single-user installs run a one-time reclaim flow to take ownership of the instance. From there you can add members with local accounts or import them from Plex, and admin-only settings stay hidden from regular members.

> [!IMPORTANT]
> Runtime configuration has moved out of config.yml and into the database, managed from a new Settings page. After upgrading, open Settings and review your configuration.

> [!IMPORTANT]
> Upgrading from v1.x? Keep your existing integration values (SLSKD_API_URL, SLSKD_API_KEY, PLEX_URL, PLEX_TOKEN, LASTFM_API_KEY, FANART_API_KEY, ACOUSTID_API_KEY, MUSICBRAINZ_CONTACT_EMAIL) in docker-compose.yml for the first boot. Synthseek will migrate them into the Settings database automatically. If you have existing data, you must also set ADMIN_MIGRATION_EMAIL, ADMIN_MIGRATION_USERNAME, and ADMIN_MIGRATION_PASSWORD on the first boot so your existing library gets an owner. The container refuses to start with a clear message if data exists and these are missing. Once the instance is up you can remove all of these from the compose file and manage everything from Settings. Fresh installs can ignore all of this and configure from the UI. Check docker-composer.yml file for an example.

> [!WARNING]
> Back up db/ before upgrading. This release ships twelve schema migrations. They run automatically on first boot, so snapshot your SQLite file in case you need to roll back.

### Synthseek 2.0: multi-user, MCP-ready, and provider-independent, with Lidarr delegation, Spotify library import, and file-based playlist import and export

Version 2.0 turns Synthseek from a single-user downloader into a self-managed, multi-user music service. It adds first-class accounts and member management, a built-in MCP server so assistants can drive your library, end-to-end localization, and a Settings UI that replaces hand-edited config files. The catalog and download layers are now fully provider-agnostic, and discovery, playlist import and export, and the Soulseek engine all grew substantially.

---

### Multi-user and accounts

- Multi-user authentication with local accounts and Plex OAuth, replacing the single-user model.
- A first-run setup wizard to create the admin account, with a one-time reclaim flow for existing installs.
- Member management: add local users or import them from Plex, with admin-only sections hidden from members.
- Per-user Plex account linking and a Connected Accounts area, with hardened Plex login.
- Members can connect and import their own Spotify library.
- A self-service profile page to update your profile and change your password.
- Requests are scoped to their owner and show who made them.

---

### MCP server and API access

- A built-in MCP server so assistants like Claude can search, request downloads, inspect your library, tune up settings and read Synthseek logs.
- API keys and a public URL setting, managed from a new MCP settings section.
- An OAuth 2.1 authorization server with a consent screen and connection guidance for MCP clients.

---

### Provider-agnostic library and downloads

- Per-request download-source selection, with an automatic yt-dlp fallback when Soulseek peers cannot deliver.
- Spotify library integration: browse, import, and sync your Spotify library from a new power-table with bulk actions.
- More library providers are on the way.
- Cover art from the active provider is embedded into downloads and Plex playlists.

---

### Discovery

- ListenBrainz and Last.fm discovery integrations that surface recent scrobbles, top tracks, and discovery mixes on the Discover page.
- Optional auto-request of playlists from your ListenBrainz discovery feeds.
- A revamped Discover page with a hero, a library leaderboard, and recent requests.

---

### Playlist import and export

- Import playlists from JSPF, XSPF, and CSV, and export to JSPF, from search and a dedicated import UI.

---

### Localization

- The interface is now available in English and Spanish, with a localized error contract end-to-end and localized relative dates.
- More languages are on the way

---

### Soulseek and the download engine

- A Soulseek user banlist with manual and automatic banning.
- Per-request minimum upload speed and free-slot filters, plus quality and peer options in the download modal.
- Per-job peer dedupe across bitrate fallback tiers and match-accuracy scoring improvements.
- Configurable search timeouts and a more resilient slskd startup.

---

### Lidarr

- Delegate artist additions to Lidarr with tag selection and progressive monitor scopes, selectable per request.

---

### Library, metadata, and operations

- Album genres and a library leaderboard.
- A managed jobs section with manual triggers.
- A logs viewer with export, level filtering, and auto-refresh, backed by a server logs API with a runtime log level.
- A warning when the AcoustID identity differs from the requested track.
- In-app updates: a new Updates section in Settings shows this patch-notes timeline and flags when a newer version is available.

---

### Fixes and hardening

- arm64 images now ship native binaries for the server bundle and the Prisma engine.
- Tolerant Plex track matching for playlist sync.
- The queue engine emits a searching status for every source.
- Malformed ISRC tags are ignored during post-download validation.
- A batch of UI and behavior fixes across search, discover, settings, requests, and theme.
- Next.js and test tooling updated for security advisories.

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
