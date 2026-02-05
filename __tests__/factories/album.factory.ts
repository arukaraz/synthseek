import { Album, RequestStatus } from "@api/__generated__/types";

let albumCounter = 0;

const generateId = () => `album-${++albumCounter}-${Date.now()}`;

const defaultAlbum: Omit<Album, "id"> = {
  spotify_id: "spotify:album:xyz789",
  name: "Test Album",
  artist: "Test Artist",
  album_art: "https://example.com/album-art.jpg",
  user_id: null,
  release_date: "2024-01-01",
  total_tracks: 10,
  completed_tracks: 0,
  status: RequestStatus.enum.queued,
  created_at: new Date("2024-01-01T00:00:00Z"),
  updated_at: new Date("2024-01-01T00:00:00Z"),
};

export function createAlbum(overrides?: Partial<Album>): Album {
  return {
    id: generateId(),
    ...defaultAlbum,
    ...overrides,
  };
}

export function createCompletedAlbum(overrides?: Partial<Album>): Album {
  return createAlbum({
    status: RequestStatus.enum.complete,
    completed_tracks: 10,
    ...overrides,
  });
}

export function createInProgressAlbum(overrides?: Partial<Album>): Album {
  return createAlbum({
    status: RequestStatus.enum.in_progress,
    completed_tracks: 5,
    ...overrides,
  });
}

export function resetAlbumCounter() {
  albumCounter = 0;
}
