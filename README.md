# Synthseek

![License](https://img.shields.io/github/license/arukaraz/synthseek)
![GitHub last commit](https://img.shields.io/github/last-commit/arukaraz/synthseek)
![GitHub stars](https://img.shields.io/github/stars/arukaraz/synthseek)
![GitHub Sponsors](https://img.shields.io/github/sponsors/arukaraz)
![Codecov](https://img.shields.io/codecov/c/github/arukaraz/synthseek)

Self-hosted, multi-user music library automation.

Synthseek searches across music providers, downloads through the sources you enable, [slskd](https://github.com/slskd/slskd), Usenet, or yt-dlp, checks that what arrived is what you asked for, and keeps your library organized afterwards. It is multi-user, provider-agnostic, and ships a built-in MCP server so assistants can drive your library.

**[Website](https://synthseek.dev) · [Documentation](https://docs.synthseek.dev) · [Patch notes](https://docs.synthseek.dev/patch-notes/)**

## Demos

<details open>
<summary><b>Discover</b></summary>

https://github.com/user-attachments/assets/4a320ff1-4176-4860-8125-b6fb3325c6a2

</details>

<details>
<summary><b>Request content</b></summary>

https://github.com/user-attachments/assets/80186e94-e060-4dd7-85d4-df7a594206e9

</details>

<details>
<summary><b>Browse and import your library</b></summary>

https://github.com/user-attachments/assets/7ebcecba-680d-4ca9-9a66-c8a760df7a57

https://github.com/user-attachments/assets/50c3988e-7ec1-41dc-9a9e-a8407043b552

</details>

## Why Synthseek

- **No API keys to get started.** The catalog is provider-agnostic and runs on Deezer by default, so a first run needs nothing you have to register for.
- **Three download sources, and you decide the order.** Peer-to-peer, Usenet, and a YouTube fallback, chosen per request rather than once globally.
- **It treats your library as something to keep honest.** Files are checked before they are imported, duplicate copies are only settled when they can be proven identical, and nothing is ever deleted outright.

## Quick start

Requires [Docker](https://docs.docker.com/get-docker/) with [Compose](https://docs.docker.com/compose/install/), and a running [slskd](https://github.com/slskd/slskd) if you want peer-to-peer downloads.

Use the provided [docker-compose.yml](docker-compose.yml) as a starting point:

```bash
docker compose up -d
```

Open the web interface, create your admin account in the setup wizard, and point it at your music folder. The full walkthrough is in [Getting Started](https://docs.synthseek.dev/getting-started/).

## What it does

### Find and request

- Search tracks, albums, artists, and playlists across a provider-agnostic catalog
- Request a single track, a whole album, or an entire playlist
- Choose the quality and the source order per request
- A queue you can reorder, pause, and resume, with live progress

[Features](https://docs.synthseek.dev/features/)

### Get the files

- slskd for peer-to-peer, Usenet through your own indexer and SABnzbd, and yt-dlp as a fallback
- A Usenet release downloaded for one track is reused for the other tracks on the same album instead of being fetched again
- Every download is fingerprinted and identified before it is imported, so a file whose tags look right but whose audio is by someone else is refused
- Anything that fails that check waits in a review queue for you to approve or discard

[Download sources](https://docs.synthseek.dev/download-sources/) · [The download engine](https://docs.synthseek.dev/download-engine/)

### Keep your library honest

- Synthseek keeps its own index of the audio files on your disk, so music you copied in by hand is found and identified rather than staying invisible
- A file that moved is followed to its new location instead of being counted as one loss and one arrival
- Tracks with more than one copy are listed a track at a time, and only copies it can prove are the same recording are settled automatically, which means agreeing on both title and length
- What it cannot prove waits for you, with every copy playable before you choose
- Nothing is deleted outright: replaced files go to a recycle bin with a restore, for as long as the retention window keeps them

[Operations](https://docs.synthseek.dev/operations/)

### Listen anywhere

- Play your library in the web app, with media keys, a lock screen and a full screen view, and nothing to turn on first
- Play your library in Subsonic and OpenSubsonic apps such as Feishin and Symfonium, with no media server in between
- Apps can change things, not only play them: favourites, playlists you create and reorder, what you played, and a queue you can pick up on another device
- A stream is converted on the fly when an app asks for a lower quality than the file on disk
- Sync playlists to Plex, one at a time or all at once

[Features](https://docs.synthseek.dev/features/)

### Automate it

- A built-in MCP server, so assistants can search, request, and manage your library
- Discovery mixes from Last.fm and ListenBrainz on a dedicated Discover page
- Lidarr delegation, with tag and monitor-scope selection
- Spotify library import, and playlist import and export as JSPF, XSPF, or CSV

[AI assistants](https://docs.synthseek.dev/ai-assistants/) · [Integrations](https://docs.synthseek.dev/integrations/)

### Run it

- Multi-user, with local accounts or Plex OAuth, member management, and per-user libraries
- A responsive web interface that works on a phone as well as a desktop
- Available in English, Espanol, Deutsch, and Francais
- Logs viewer, background job controls, and in-app update notifications

[Users and permissions](https://docs.synthseek.dev/users-permissions/) · [Configuration](https://docs.synthseek.dev/configuration/)

## Documentation

|                                                                        |                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------- |
| [Overview](https://docs.synthseek.dev/overview/)                       | What Synthseek is and how the pieces fit          |
| [Getting Started](https://docs.synthseek.dev/getting-started/)         | Install, first run, and pointing it at your music |
| [Features](https://docs.synthseek.dev/features/)                       | Everything the app does, in detail                |
| [Download engine](https://docs.synthseek.dev/download-engine/)         | How a request becomes a file in your library      |
| [Download sources](https://docs.synthseek.dev/download-sources/)       | slskd, Usenet, and the YouTube fallback           |
| [Configuration](https://docs.synthseek.dev/configuration/)             | Environment variables and in-app settings         |
| [Users and permissions](https://docs.synthseek.dev/users-permissions/) | Accounts, roles, and what members can see         |
| [Integrations](https://docs.synthseek.dev/integrations/)               | Plex, Lidarr, Last.fm, ListenBrainz, and more     |
| [AI assistants](https://docs.synthseek.dev/ai-assistants/)             | The MCP server and its tools                      |
| [Operations](https://docs.synthseek.dev/operations/)                   | Jobs, logs, health, backups, and updates          |
| [FAQ](https://docs.synthseek.dev/faq/)                                 | Common questions and troubleshooting              |

## Help

For bugs or questions, [open an issue](https://github.com/arukaraz/synthseek/issues).

## Support

<a href="https://github.com/sponsors/arukaraz"><img src="https://img.shields.io/badge/Sponsor_❤-EA4AAA?style=for-the-badge&logo=GitHub-Sponsors&logoColor=white" alt="Sponsor on GitHub" /></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ko-fi.com/arukaraz"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support on Ko-fi" /></a>

## License

This project is licensed under the [MIT License](LICENSE).
