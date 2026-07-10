# Patch Notes

---

# v2.3.3, July 9, 2026

- Rename a playlist at request time: the request window now has an optional name field, so it lands in your library with the name you want.
- Playlist renames now sync both ways with Plex: rename in Synthseek and Plex follows in seconds, rename in Plex and Synthseek picks it up automatically.
- A new Media Server Sync job keeps your Plex playlists named right and topped up with any tracks they are missing, with its own Run now button in Settings, Jobs. The Jobs screen now only shows jobs relevant to your setup.
- Requesting a big playlist no longer blocks you: it is accepted instantly, tracks fill in the background, and a progress dock keeps you posted.

---

### Fixes

- Typing spaces while renaming a playlist from its card menu works again.
- Synthseek now starts with a clear error message when a Docker folder is mounted read-only, instead of failing without explanation.

---

# v2.3.2, June 22, 2026

- Polished the content detail and settings screens, with a better request detail layout on mobile.

---

# v2.3.1, June 21, 2026

### Sync library playlists to Plex, plus AI playlist building from Last.fm

- Sync a playlist to Plex straight from your library: the three-dot menu on any library playlist now has a Sync to Plex action, the same one already on the requests page.
- MCP tools extended to read your Last.fm listening history (top tracks, recent tracks, top artists) and to build or refresh a playlist from a set of songs in one step, so a connected AI assistant can curate playlists for you. [See the full list of MCP tools and examples](https://github.com/arukaraz/synthseek/blob/main/MCP-TOOLS.md).
- The interface is now available in German and French, in addition to English and Spanish.

---

### Fixes

- Refreshed playlists now show the correct status based on how their tracks downloaded.

---

# v2.3.0, June 19, 2026

### Content detail, playlist management, and a smarter requests view

- A rich detail view for artists, albums, and playlists with artwork, bios, related content, and live per-track status, opening in place so you can dig in without losing your spot.
- Full playlist management: create, rename, and delete your own playlists, add or remove tracks, and pick several at once. Imported Spotify playlists get a Keep in sync switch that guards them while they sync.
- A mobile bottom navigation bar for easier use on phones.
- A redesigned Spotify import with clearer selection and optional auto-import.
- Retry several failed tracks at once from the library.

---

### Improvements

- The Requests page now orders by most recent activity, so anything you just requested or re-requested jumps to the top, and each row shows when it was requested and last updated.
- Library views now refresh on their own as downloads finish, no manual reload needed.
- Sorting library tracks by status now follows the real download pipeline order.
- The queue bar shows a clear Paused state when you pause downloads.
- Faster, steadier metadata thanks to consolidated caching and per-source search timeouts.

---

### Fixes

- Discovery mix refreshes (Weekly Jams, Weekly Exploration, and friends) are now atomic, so a mix is never left empty in the middle of a refresh.
- Requesting a playlist or album no longer errors or leaves an empty playlist when several tracks share the same album.
- Fixed an interactivity glitch when opening the app over a plain local HTTP address.
- ListenBrainz discovery playlists stay as one playlist across refreshes instead of duplicating.
- Quieter startup logs and a smoother first run.

---

# v2.2.0, June 13, 2026

### A new Library to browse your whole collection

- A new Library section to browse everything you have, tracks, albums, artists, and playlists, with filters, search, sorting, and smooth scrolling. Exploring Artists and Albums metadata is a WIP.
- A floating progress panel that shows live progress while syncing to Plex or importing playlists.
- ListenBrainz can now optionally keep one playlist updated with fresh recommendations on every refresh, instead of creating a new dated playlist each time.
- Requesting an album now shows it even when you already have its songs from a playlist, reusing what you already have.
- Redesigned notifications with a cleaner, more readable look.

---

### Improvements

- Better Plex matching, so more of your tracks are found and fewer are dropped from playlists (try resyncing your existing playlists to plex).
- Duplicate songs in an imported playlist are now collapsed, with a count of how many were skipped.
- Downloads are more resilient to temporary YouTube failures.

---

### Fixes

- Empty album leftovers are no longer kept when a playlist or track is deleted.
- You are now prompted to reconnect when a Spotify connection expires.
- Imports no longer fail on songs you already have, and failures now show a clear, accurate reason.
- Various visual fixes to the loading spinner, the notification icon, and more.

---

# v2.1.2, June 10, 2026

- Tracks that were wrongly skipped as not found now download correctly.
- Searches that come up empty are retried automatically, so more songs are found.
- More results are checked for each track, so the right match is less likely to be missed.

---

# v2.1.1, June 8, 2026

### Sync all playlists to Plex, plus detail-table and changelog fixes

A small follow-up to 2.1: send every eligible playlist to Plex in one action, and fix a couple of UI rough edges.

---

### Improvements

- Sync all playlists to Plex at once from the toolbar menu, alongside the existing per-playlist sync.

---

### Fixes

- Fixed stale rows and empty gaps in the request detail table when switching between playlists or albums.
- The changelog fix badge now renders in red.

---

# v2.1.0, June 8, 2026

### Queue controls: priority, pause and resume, a queue stability fix, and Plex matching improvements

Version 2.1 gives you direct control over the download queue. Downloads now run one album or playlist at a time in order, you can jump any track or group to the front, and you can pause and resume individual albums and playlists or the whole queue. It also fixes a queue stability bug that could stall downloads and sharpens Plex matching.

---

### Queue controls

- Downloads are ordered by album and playlist: every track in a group finishes before the next group starts.
- Jump the queue: move any track, album, or playlist to the front from its actions menu, with a Prioritized badge so you can see it took effect. Retried tracks are prioritized automatically.
- Pause and resume individual albums and playlists, or Pause all and Resume all for the whole queue, from the toolbar.

---

### Fixes

- Fixed a queue stability issue where finished jobs were never cleared from memory, which could fill the queue and stall all new downloads. The queue now drains completed work and resumes pending downloads automatically after a restart.
- Hardened Plex track matching for missed library tracks, with album-position hydration, corrected playlist membership, parenthesized featuring-suffix handling, and tolerant fuzzy matching.
- Excluded live event-stream connections from the API rate limiter so the UI stays connected under load.
- Collapsed duplicate tracks within a playlist import so a song that appears twice no longer fails the import.
- Hid the Artist Spotlight song count when an artist's track total is unknown.

---

# v2.0.0, June 5, 2026

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

# v1.2.1, May 4, 2026

### Track failures now tell you why

When a track fails, the request card surfaces a typed failure reason
with an icon and tooltip instead of a generic error. Reasons are
classified into:

- **Not found**, no source matched the requested track.
- **Import rejected**, Beets / Plex declined the file (metadata,
  format, or duplicate).
- **P2P failed**, Soulseek peers errored out or never delivered.
- **Other**, fallback for unclassified failures.

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
  validation, they're ignored instead.
- Music cache warmup runs every 6 hours instead of every 25 minutes,
  reducing background load.
- Track count is hidden in the artist album list when unavailable
  instead of showing a placeholder.
- The sort filter is dropped from playlist navigation after submitting
  a request so you land on the freshly-added item.
- Date sort is inverted so the newest items appear first.

---

# v1.2.0, April 19, 2026

> [!IMPORTANT]
> Two files are worth re-checking when you upgrade.
>
> **`config.yml`** has new sections in this release. After deploying,
> check the refreshed `config.example.yml` sitting next to your
> `config.yml`, diff them side-by-side and copy over the new flags
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
default adapter today, no authentication required, no rate-limit
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

You can now request a full playlist from search or discover, Synthseek
will download every track individually, preserve the original ordering,
and reconstruct the playlist inside Plex when the download finishes. If
some tracks resolve late (retries, slow peers), the Plex playlist is
synced incrementally as each new track arrives instead of waiting for
all of them.

A new playlist status badge shows where each playlist is in its life
cycle, **Syncing to Plex…** while the reconstruction is in flight,
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

# v1.1.0, March 26, 2026

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
