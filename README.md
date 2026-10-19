# Synthseek

![License](https://img.shields.io/github/license/arukaraz/synthseek)
![GitHub last commit](https://img.shields.io/github/last-commit/arukaraz/synthseek)
![GitHub stars](https://img.shields.io/github/stars/arukaraz/synthseek)
![GitHub Sponsors](https://img.shields.io/github/sponsors/arukaraz)
![Codecov](https://img.shields.io/codecov/c/github/arukaraz/synthseek)

Self-hosted, multi-user music library automation.

Synthseek searches across music providers, downloads through the sources you enable, such as [slskd](https://github.com/slskd/slskd), Usenet, torrent or yt-dlp, checks that what arrived is what you asked for, and keeps your library organized afterwards. It is multi-user, provider-agnostic, and ships a built-in MCP server so assistants can drive your library.

**[Website](https://synthseek.dev) · [Documentation](https://docs.synthseek.dev) · [Patch notes](https://docs.synthseek.dev/patch-notes/)**

## Demos

<details open>
<summary><b>Discover</b></summary>

https://github.com/user-attachments/assets/4a320ff1-4176-4860-8125-b6fb3325c6a2

</details>

<details>
<summary><b>Request content</b></summary>

https://github.com/user-attachments/assets/3dfa1953-d164-43ba-bced-10db29ced01e

</details>

<details>
<summary><b>Browse and import your library</b></summary>

https://github.com/user-attachments/assets/674fdded-77cd-4d66-988b-7789bd033654

https://github.com/user-attachments/assets/50c3988e-7ec1-41dc-9a9e-a8407043b552

</details>

## Why Synthseek

- **No API keys to get started.** The catalog is provider-agnostic and runs on Deezer by default, so a first run needs nothing you have to register for.
- **Seven download sources, and you decide the order.** Peer-to-peer, Usenet, torrent, another Subsonic server, and fallbacks to YouTube, SoundCloud and the Internet Archive, chosen per request rather than once globally.
- **It treats your library as something to keep honest.** Files are checked before they are imported, duplicate copies are only settled when they can be proven identical, and nothing in your library is ever deleted outright.

## Quick start

Requires [Docker](https://docs.docker.com/get-docker/) with [Compose](https://docs.docker.com/compose/install/). The setup wizard asks for a running [slskd](https://github.com/slskd/slskd), the peer-to-peer source, and lets you continue past a failed connection test if you use other sources.

Use the provided [docker-compose.yml](docker-compose.yml) as a starting point:

```bash
docker compose up -d
```

Open the web interface and follow the setup wizard: an admin account, slskd, then an optional Plex sign-in and API keys. Your music folder is the `/music` volume in the compose file. The full walkthrough is in [Getting Started](https://docs.synthseek.dev/getting-started/).

## What it does

### Find and request

- Search tracks, albums, artists, and playlists across a provider-agnostic catalog
- Request a single track, a whole album, or an entire playlist
- Choose the quality and the source order per request
- A queue you can reorder, pause, and resume, with live progress

[Features](https://docs.synthseek.dev/features/)

### Get the files

- slskd for peer-to-peer, Usenet through your own indexer and SABnzbd, torrent through your own indexer and qBittorrent, and another Subsonic server, with yt-dlp, SoundCloud and the Internet Archive as fallbacks
- A Usenet or torrent release downloaded for one track is kept for a while, so the other tracks on the same album can come from it
- Every download's tags are checked against your request, and with a free AcoustID key its audio is identified too, so a file whose tags look right but whose audio is by another artist is refused
- A file that positively contradicts your request waits in a review queue for you to approve or discard

[Download sources](https://docs.synthseek.dev/download-sources/) · [The download engine](https://docs.synthseek.dev/download-engine/)

### Keep your library honest

- Synthseek keeps its own index of the audio files on your disk, so music you copied in by hand is found and identified, and you can match or ignore what it cannot recognise
- A file that moved is followed to its new location instead of being counted as one loss and one arrival
- Keep your music in more than one library path, such as a second disk, with rules that decide which music goes where, by artist, genre, year, who asked for it and more
- You decide the folders and filename every track gets in each path, and a preview shows every change before anything moves
- Files already on disk can be brought in line with that format, or left exactly where they are
- Tracks with more than one copy are listed a track at a time, and only copies it can prove are the same recording are settled automatically, which means agreeing on both title and length
- What it cannot prove waits for you, with every copy playable before you choose
- Nothing is deleted outright: replaced files go to a recycle bin with a restore, for as long as the retention window keeps them

[Operations](https://docs.synthseek.dev/operations/)

### Listen anywhere

- Play your library in the web app, with media keys, a lock screen and a full screen view, and nothing to turn on first
- The player can shrink into the top bar, or pop out into a small floating window where your browser supports one
- Your queue and position are kept on the server, so they survive a reload and are the same ones your phone picks up
- With autoplay on, the queue does not run out: the player adds the closest tracks your library has to what you chose, and you can start a radio from any track, album or artist
- An equalizer, a preamp, a compressor and gapless or blended transitions in the player, with presets or curves of your own, kept per browser
- Volume evened out between tracks
- Once you turn it on, play your library in Subsonic and OpenSubsonic apps such as Feishin and Symfonium, with no media server in between
- Apps can change things, not only play them: favourites, playlists you create and reorder, what you played, and a queue you can pick up on another device
- A stream is converted on the fly when an app asks for a lower quality than the file on disk
- Send what you play to Last.fm and ListenBrainz
- Read the lyrics in the full screen view, following the song where they come with timings
- Sync playlists to Plex, Navidrome or Jellyfin, one at a time or all at once
- Play a track from Plex, Navidrome or Jellyfin when Synthseek has no file for it

[Features](https://docs.synthseek.dev/features/)

### Automate it

- A built-in MCP server, so assistants can search, request, manage your library and run the player
- A Discover board each member arranges, with mixes from Last.fm and ListenBrainz, sets and stations built from your own plays, charts, and artists and albums similar to what you play
- Lidarr delegation, with tag and monitor-scope selection
- Library import from Spotify, and playlist import from Plex, Navidrome or Jellyfin
- Playlist import from JSPF, XSPF, or CSV, and export as JSPF

[AI assistants](https://docs.synthseek.dev/ai-assistants/) · [Integrations](https://docs.synthseek.dev/integrations/)

### Run it

- Multi-user, with local accounts or Plex OAuth, member management, and per-user libraries
- Optional approval for members' requests, and download quotas per member and for the whole library
- A responsive web interface that works on a phone as well as a desktop
- Available in English, Español, Deutsch, and Français
- Logs viewer, background job controls, a system status page, listening, library and download numbers on the settings overview, and in-app update notifications
- Notifications on Discord, ntfy or Telegram, plus a webhook or Apprise for administrators, with each member picking what they receive

[Users and permissions](https://docs.synthseek.dev/users-permissions/) · [Configuration](https://docs.synthseek.dev/configuration/)

## Documentation

|                                                                        |                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------- |
| [Overview](https://docs.synthseek.dev/)                                | What Synthseek is and how the pieces fit          |
| [Getting Started](https://docs.synthseek.dev/getting-started/)         | Install, first run, and pointing it at your music |
| [Features](https://docs.synthseek.dev/features/)                       | Everything the app does, in detail                |
| [Download engine](https://docs.synthseek.dev/download-engine/)         | How a request becomes a file in your library      |
| [Download sources](https://docs.synthseek.dev/download-sources/)       | All seven sources, and the order they run in      |
| [Configuration](https://docs.synthseek.dev/configuration/)             | Environment variables and in-app settings         |
| [Users and permissions](https://docs.synthseek.dev/users-permissions/) | Accounts, roles, and what members can see         |
| [Integrations](https://docs.synthseek.dev/integrations/)               | Plex, Navidrome, Jellyfin, Lidarr, and more       |
| [AI assistants](https://docs.synthseek.dev/ai-assistants/)             | The MCP server and its tools                      |
| [Operations](https://docs.synthseek.dev/operations/)                   | Jobs, logs, health, backups, and updates          |
| [FAQ](https://docs.synthseek.dev/faq/)                                 | Common questions and troubleshooting              |

## Help

For bugs or questions, [open an issue](https://github.com/arukaraz/synthseek/issues).

## Support

<a href="https://github.com/sponsors/arukaraz"><img src="https://img.shields.io/badge/Sponsor_❤-EA4AAA?style=for-the-badge&logo=GitHub-Sponsors&logoColor=white" alt="Sponsor on GitHub" /></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ko-fi.com/arukaraz"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support on Ko-fi" /></a>

## License

This project is licensed under the [MIT License](LICENSE).
