# Synthseek

![License](https://img.shields.io/github/license/arukaraz/synthseek)
![GitHub last commit](https://img.shields.io/github/last-commit/arukaraz/synthseek)
![GitHub stars](https://img.shields.io/github/stars/arukaraz/synthseek)
![GitHub Sponsors](https://img.shields.io/github/sponsors/arukaraz)
![Codecov](https://img.shields.io/codecov/c/github/arukaraz/synthseek)

Self-hosted Music discovery and library management.

Synthseek helps you discover music, connects with [slskd](https://github.com/slskd/slskd), and organizes your library with Beets.

## Features

- Modern, responsive Web UI (mobile and desktop friendly)
- Search for tracks, albums, artists, and playlists
- slskd integration for Soulseek network
- Metadata matching with MusicBrainz and AcoustID
- Automatic file organization with Beets
- Real-time progress tracking
- Optional Plex integration for library scanning

<details>
<summary><span style="font-size:1.25em; font-weight:bold">Screenshots</span></summary>

<img src="https://github.com/user-attachments/assets/6511d640-69ee-4742-adb7-fe5b9f380eac" width="100%" alt="home">
<img src="https://github.com/user-attachments/assets/50051f74-b915-45f8-aa09-db106b45703c" width="100%" alt="search">
<img src="https://github.com/user-attachments/assets/74adc87d-c381-4a94-a9ee-3d613a7f9e5e" width="100%" alt="config">
<img src="https://github.com/user-attachments/assets/990ca52a-a4b6-46b7-a587-62ff38531f22" width="100%" alt="listview">

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


## Roadmap

Planned features and improvements:

- [ ] Playlist-to-Plex support
- [ ] User authentication
- [ ] Last.fm integration for library import
- [ ] Personal library import functionality
- [ ] Lidarr integration
- [ ] Native mobile app

This project is open to suggestions. Feel free to [open an issue](https://github.com/arukaraz/synthseek/issues) with your ideas.

## Help

For bugs or questions, [open an issue](https://github.com/arukaraz/synthseek/issues).

## Support

If this project saved you clicks, a coffee goes a long way:

<a href="https://github.com/sponsors/arukaraz"><img src="https://img.shields.io/badge/Sponsor_❤-EA4AAA?style=for-the-badge&logo=GitHub-Sponsors&logoColor=white" alt="Sponsor on GitHub" /></a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://ko-fi.com/arukaraz"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support on Ko-fi" /></a>

## License

This project is licensed under the [MIT License](LICENSE).
