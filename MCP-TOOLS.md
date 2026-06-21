# Synthseek MCP Tools

Synthseek connects to an AI assistant (such as Claude) through MCP, the Model Context Protocol. Once connected, you can just ask the assistant in plain language, and it will search, download, and organize your music library for you using the tools below. Every connection is your own: each member links their own assistant, and that assistant only ever sees and acts on that member's account and library, with access shaped by their role.

## Usage examples

Just ask the assistant in plain language, the way you would ask a friend who manages your music. For example:

- **Weekly mixes on autopilot:** you can set up a weekly routine where the assistant looks at your recent listening history and rebuilds personal, Spotify-style mixes for you (a Daily Mix, Your Top Mix, Jump Back In, On Repeat). Each week it refreshes those same playlists with fresh picks based on what you have been into lately, so they stay current without piling up duplicates, and any songs you do not have yet are downloaded automatically.
- **"Build me a playlist of upbeat 2000s pop punk."** The assistant finds the songs, downloads the ones you are missing, and saves them as a new playlist.
- **"Get me the latest album from X."** The assistant looks it up and downloads the full album to your library.
- **"Recommend some new music based on what I have been listening to, and grab a few tracks."** The assistant uses your listening history to suggest songs and adds them to your library.

## Search & Discovery

- `search_music`, find songs, albums, artists, and playlists to download (it even understands moods and genres, like "melancholic 80s synthwave").
- `get_music_details`, look up the full details of a specific song, album, artist, or playlist.
- `get_artist_overview`, get a rounded picture of an artist (their profile, albums, top tracks, and similar artists) in one go.
- `get_trending`, see what songs are trending right now based on real charts.
- `browse_genres`, browse the list of music genres you can explore.
- `get_recommendations`, get personalized discovery picks from your connected ListenBrainz or Last.fm accounts.
- `resolve_url`, paste a link from another platform (Spotify, Apple Music, YouTube, and more) and turn it into songs you can download.

## Downloads

- `download_track`, download a single song to your library.
- `download_album`, download a full album to your library.
- `download_playlist`, download an entire playlist from the catalog to your library.
- `retry_request`, try a failed song, album, or playlist download again.
- `cancel_request`, cancel a download that is queued or in progress.
- `retry_all_failed`, retry every download that has failed in one go.

## Requests

- `list_requests`, see your download requests and how far along they are (for example, what is downloading right now).
- `get_request`, get a detailed look at one download, including each song's status and an explanation of anything that failed.

## Playlists

- `list_playlists`, see your own library playlists, with their track counts and sync status.
- `get_playlist`, get a detailed look at one of your playlists, including each song's status and any failures.
- `create_playlist`, create a new playlist from songs already in your library.
- `add_tracks_to_playlist`, add songs from your library to one of your playlists.
- `replace_playlist_tracks`, set the complete list of songs for one of your playlists, replacing whatever was there before.
- `remove_tracks_from_playlist`, remove songs from one of your playlists.
- `delete_playlist`, delete one of your playlists.
- `update_playlist`, rename a playlist or turn its keep-in-sync option on or off.
- `control_playlist`, manage a playlist's downloads by prioritizing, pausing, resuming, cancelling, or retrying them.
- `sync_playlist_to_plex`, push a playlist (or all of your eligible playlists) to your Plex server.

## Library

- `get_library_summary`, get an overview of your library, including totals, top artists and genres, and your queue size.
- `search_library`, search the music you already have to find a specific song (handy for checking before you download).

## Last.fm

- `get_lastfm_scrobbles`, read your Last.fm listening history (your top tracks, recent tracks, or top artists).

## Settings

- `get_settings`, view the settings you are allowed to see (secret values are always kept hidden).
- `update_setting`, change a settings section you are allowed to manage, such as your discovery integrations.

## System & Operations

- `get_queue_stats`, check the download queue at a glance, including whether it is paused.
- `pause_queue`, pause the download queue and stop everything currently in progress.
- `resume_queue`, resume the download queue and pick up paused downloads.
- `trigger_job`, run a background job right now (such as library sync or discovery).
- `get_system_health`, check that Synthseek and its connected services are healthy.
- `list_log_files`, see the available server log files.
- `read_logs`, read the latest server log entries when something needs troubleshooting.
