# Patch Notes

---

## v1.1.0 — March 26, 2026

### Spotify API Migration (Feb 2026 Breaking Changes)

Adapted to Spotify's February 2026 API restrictions that require Premium
accounts for API access and impose stricter rate limits. Search and album
track limits reduced to 10, trending tracks rewritten to use direct search
instead of playlist endpoints (now requiring user OAuth), and browse
categories replaced with a static genre list.

Reference: https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security


---

### Version Update Notifications

Added automatic detection of new releases published to GitHub Container Registry.
A dismissable ribbon banner appears at the top of the page when a newer version is available and reappears on page refresh until the user updates.
