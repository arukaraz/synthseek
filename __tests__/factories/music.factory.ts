interface MusicImage {
  url: string;
  height?: number | null;
  width?: number | null;
}

interface ArtistRef {
  id: string;
  name: string;
}

interface TrackBase {
  id: string;
  type: string;
  title: string;
  name: string;
  artists: ArtistRef[];
  duration_ms: number;
  track_number: number;
  disc_number: number;
  explicit: boolean;
  isrc: string | null;
  images: MusicImage[];
  [key: string]: unknown;
}

interface AlbumBase {
  id: string;
  type: string;
  name: string;
  title: string;
  artists: ArtistRef[];
  images: MusicImage[];
  release_date: string;
  total_tracks: number;
  [key: string]: unknown;
}

export function createMockImage(overrides?: Partial<MusicImage>): MusicImage {
  return {
    url: "https://cdn-images.dzcdn.net/images/cover/test/500x500.jpg",
    height: 500,
    width: 500,
    ...overrides,
  };
}

export function createMockArtistSimplified(overrides?: Partial<ArtistRef>): ArtistRef {
  return {
    id: "artist-001",
    name: "Test Artist",
    ...overrides,
  };
}

export function createMockAlbumSimplified(overrides?: Partial<AlbumBase>): AlbumBase {
  return {
    id: "album-001",
    type: "album",
    name: "Test Album",
    title: "Test Album",
    artists: [createMockArtistSimplified()],
    images: [createMockImage()],
    release_date: "2024-01-01",
    total_tracks: 10,
    ...overrides,
  };
}

export function createMockTrackSimplified(overrides?: Partial<TrackBase>): TrackBase {
  return {
    id: "track-001",
    type: "track",
    title: "Test Track",
    name: "Test Track",
    artists: [createMockArtistSimplified()],
    duration_ms: 180000,
    track_number: 1,
    disc_number: 1,
    explicit: false,
    isrc: null,
    images: [],
    ...overrides,
  };
}

export function createMockTrackFull(
  overrides?: Partial<TrackBase & { album: Partial<AlbumBase> }>
): TrackBase & { album: AlbumBase } {
  const album = createMockAlbumSimplified(overrides?.album);
  return {
    ...createMockTrackSimplified(),
    album,
    images: album.images,
    isrc: "USRC12345678",
    popularity: 75,
    ...overrides,
    // Ensure album is always the full object, not a partial
    ...(overrides?.album ? { album: { ...album, ...overrides.album } } : { album }),
  } as TrackBase & { album: AlbumBase };
}

export function createMockArtistFull(
  overrides?: Partial<{
    id: string;
    type: string;
    name: string;
    images: MusicImage[];
    genres: string[];
    followers: number | null;
  }>
): {
  id: string;
  type: string;
  name: string;
  images: MusicImage[];
  genres: string[];
  followers: number | null;
} {
  return {
    id: "artist-001",
    type: "artist",
    name: "Test Artist",
    images: [createMockImage()],
    genres: ["pop", "rock"],
    followers: 1000000,
    ...overrides,
  };
}

export function createMockPlaylistSimplified(
  overrides?: Partial<{
    id: string;
    type: string;
    name: string;
    title: string;
    images: MusicImage[];
    owner: { id: string; name: string; display_name?: string };
    total_tracks: number;
  }>
): {
  id: string;
  type: string;
  name: string;
  title: string;
  images: MusicImage[];
  owner: { id: string; name: string; display_name?: string };
  total_tracks: number;
} {
  return {
    id: "playlist-001",
    type: "playlist",
    name: "Test Playlist",
    title: "Test Playlist",
    images: [createMockImage()],
    owner: { id: "user-001", name: "Test User", display_name: "Test User" },
    total_tracks: 50,
    ...overrides,
  };
}

export function createMockPlaylistTrack(overrides?: Partial<{ track: TrackBase & { album: AlbumBase } }>): {
  added_at: string;
  track: TrackBase & { album: AlbumBase };
} {
  return {
    added_at: "2024-01-01T00:00:00Z",
    track: createMockTrackFull(),
    ...overrides,
  };
}
