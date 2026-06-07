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
- slskd integration for P2P downloads, with an automatic or optional yt-dlp fallback
- Per-request download-source and quality selection
- Spotify library import, and playlist import and export (JSPF, XSPF, CSV)
- Discovery integrations with Last.fm and ListenBrainz
- Lidarr delegation with tag and monitor-scope selection
- Metadata matching with MusicBrainz and AcoustID
- Automatic file organization with Beets
- End-to-end playlist downloads with automatic Plex reconstruction
- Built-in MCP server, so assistants can search and manage your library
- Localization (more languages are on the way...)
- Real-time progress tracking, logs viewer, and in-app update notifications

## Demos

<details open>
<summary><b>Discover</b></summary>
  
https://github.com/user-attachments/assets/74a399fa-3fda-4341-9486-1e214e9a90b7



</details>

<details>
<summary><b>Request content</b></summary>
  
https://github.com/user-attachments/assets/f44d9dc2-bf2a-401d-a6c0-564e261123d1

</details>

<details>
<summary><b>Import your library</b></summary>
  
https://github.com/user-attachments/assets/9dfe699f-b320-4974-87f0-293a0e97a0a5

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

If this project saved you some clicks, a beer always helps:

<a href="https://github.com/sponsors/arukaraz"><img src="https://img.shields.io/badge/Sponsor_❤-EA4AAA?style=for-the-badge&logo=GitHub-Sponsors&logoColor=white" alt="Sponsor on GitHub" /></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ko-fi.com/arukaraz"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support on Ko-fi" /></a>

## License

This project is licensed under the [MIT License](LICENSE).
