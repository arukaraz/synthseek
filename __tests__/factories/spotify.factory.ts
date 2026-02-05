export function createSpotifyImage(overrides?: Partial<SpotifyApi.ImageObject>): SpotifyApi.ImageObject {
  return {
    url: "https://i.scdn.co/image/test",
    height: 300,
    width: 300,
    ...overrides,
  };
}

export function createSpotifyArtistSimplified(
  overrides?: Partial<SpotifyApi.ArtistObjectSimplified>
): SpotifyApi.ArtistObjectSimplified {
  return {
    external_urls: { spotify: "https://open.spotify.com/artist/test" },
    href: "https://api.spotify.com/v1/artists/test",
    id: "artist-001",
    name: "Test Artist",
    type: "artist",
    uri: "spotify:artist:test",
    ...overrides,
  };
}

export function createSpotifyAlbumSimplified(
  overrides?: Partial<SpotifyApi.AlbumObjectSimplified>
): SpotifyApi.AlbumObjectSimplified {
  return {
    album_type: "album",
    total_tracks: 10,
    available_markets: ["US"],
    external_urls: { spotify: "https://open.spotify.com/album/test" },
    href: "https://api.spotify.com/v1/albums/test",
    id: "album-001",
    images: [createSpotifyImage()],
    name: "Test Album",
    release_date: "2024-01-01",
    release_date_precision: "day",
    type: "album",
    uri: "spotify:album:test",
    artists: [createSpotifyArtistSimplified()],
    ...overrides,
  };
}

export function createSpotifyTrackSimplified(
  overrides?: Partial<SpotifyApi.TrackObjectSimplified>
): SpotifyApi.TrackObjectSimplified {
  return {
    artists: [createSpotifyArtistSimplified()],
    available_markets: ["US"],
    disc_number: 1,
    duration_ms: 180000,
    explicit: false,
    external_urls: { spotify: "https://open.spotify.com/track/test" },
    href: "https://api.spotify.com/v1/tracks/test",
    id: "track-001",
    is_playable: true,
    name: "Test Track",
    preview_url: "https://p.scdn.co/mp3-preview/test",
    track_number: 1,
    type: "track",
    uri: "spotify:track:test",
    is_local: false,
    ...overrides,
  };
}

export function createSpotifyTrackFull(overrides?: Partial<SpotifyApi.TrackObjectFull>): SpotifyApi.TrackObjectFull {
  return {
    ...createSpotifyTrackSimplified(),
    album: createSpotifyAlbumSimplified(),
    external_ids: { isrc: "USRC12345678" },
    popularity: 75,
    ...overrides,
  } as SpotifyApi.TrackObjectFull;
}

export function createSpotifyArtistFull(overrides?: Partial<SpotifyApi.ArtistObjectFull>): SpotifyApi.ArtistObjectFull {
  return {
    ...createSpotifyArtistSimplified(),
    followers: { href: null, total: 1000000 },
    genres: ["pop", "rock"],
    images: [createSpotifyImage()],
    popularity: 80,
    ...overrides,
  } as SpotifyApi.ArtistObjectFull;
}

export function createSpotifyPlaylistSimplified(
  overrides?: Partial<SpotifyApi.PlaylistObjectSimplified>
): SpotifyApi.PlaylistObjectSimplified {
  return {
    collaborative: false,
    description: "Test playlist description",
    external_urls: { spotify: "https://open.spotify.com/playlist/test" },
    href: "https://api.spotify.com/v1/playlists/test",
    id: "playlist-001",
    images: [createSpotifyImage()],
    name: "Test Playlist",
    owner: {
      external_urls: { spotify: "https://open.spotify.com/user/test" },
      href: "https://api.spotify.com/v1/users/test",
      id: "user-001",
      type: "user",
      uri: "spotify:user:test",
      display_name: "Test User",
    },
    public: true,
    snapshot_id: "snapshot-001",
    tracks: { href: "https://api.spotify.com/v1/playlists/test/tracks", total: 50 },
    type: "playlist",
    uri: "spotify:playlist:test",
    ...overrides,
  };
}

export function createSpotifyPlaylistTrack(
  overrides?: Partial<SpotifyApi.PlaylistTrackObject>
): SpotifyApi.PlaylistTrackObject {
  return {
    added_at: "2024-01-01T00:00:00Z",
    added_by: {
      external_urls: { spotify: "https://open.spotify.com/user/test" },
      href: "https://api.spotify.com/v1/users/test",
      id: "user-001",
      type: "user",
      uri: "spotify:user:test",
    },
    is_local: false,
    track: createSpotifyTrackFull(),
    ...overrides,
  };
}
