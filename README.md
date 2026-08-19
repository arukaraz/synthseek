# Synthseek

![License](https://img.shields.io/github/license/arukaraz/synthseek)
![GitHub last commit](https://img.shields.io/github/last-commit/arukaraz/synthseek)
![GitHub stars](https://img.shields.io/github/stars/arukaraz/synthseek)
![GitHub Sponsors](https://img.shields.io/github/sponsors/arukaraz)
![Codecov](https://img.shields.io/codecov/c/github/arukaraz/synthseek)

Self-hosted, multi-user music library automation.

Synthseek searches across music providers, downloads through your [slskd](https://github.com/slskd/slskd) instance, matches metadata, and organizes your personal library with Beets. It is multi-user, provider-agnostic, and ships a built-in MCP server so assistants can drive your library.

## Features

- Modern, responsive web UI (mobile and desktop friendly)
- Multi-user: local accounts and Plex OAuth, with member management and per-user libraries
- Provider-agnostic catalog (Deezer by default, no API keys required)
- Search for tracks, albums, artists, and playlists
- A full music library to browse and manage everything you have downloaded, organized by albums, artists, playlists, and tracks
- Playlist management: create, rename, and delete your own playlists, and add or remove tracks
- Sync playlists to Plex, one at a time or all at once
- slskd integration for P2P downloads, with an automatic or optional yt-dlp fallback
- Download queue controls, with priority, pause, and resume
- Per-request download-source and quality selection
- Spotify library import, and playlist import and export (JSPF, XSPF, CSV)
- Discovery integrations with Last.fm and ListenBrainz, with discovery mixes on a dedicated Discover page
- Lidarr delegation with tag and monitor-scope selection
- Metadata matching
- Automatic file organization
- End-to-end playlist downloads with automatic Plex reconstruction
- Built-in MCP server, so assistants can search and manage your library ([see the full list and examples of MCP tools](https://docs.synthseek.dev/ai-assistants/))
- Localization in English, Espanol, Deutsch, and Francais
- Real-time progress tracking, logs viewer, and in-app update notifications

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

## Installation

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Running [slskd](https://github.com/slskd/slskd) instance

### Docker Compose

Use the provided [docker-compose.yml](docker-compose.yml) as a starting point:

```bash
docker-compose up -d
```

## Help

For bugs or questions, [open an issue](https://github.com/arukaraz/synthseek/issues).

## Support

<a href="https://github.com/sponsors/arukaraz"><img src="https://img.shields.io/badge/Sponsor_❤-EA4AAA?style=for-the-badge&logo=GitHub-Sponsors&logoColor=white" alt="Sponsor on GitHub" /></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ko-fi.com/arukaraz"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support on Ko-fi" /></a>

## License

This project is licensed under the [MIT License](LICENSE).
