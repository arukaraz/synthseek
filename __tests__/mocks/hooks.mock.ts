import { vi } from "vitest";
import type { TrackRequest, Album, MusicTrack, MusicAlbum, MusicArtist, MusicPlaylist } from "@api/__generated__/types";

export const createMockUseRequest = (overrides: Partial<ReturnType<typeof createMockUseRequest>> = {}) => ({
  requests: [] as TrackRequest[],
  isLoading: false,
  refreshRequests: vi.fn().mockResolvedValue({ data: [] }),
  stats: { total: 0, queued: 0, active: 0, complete: 0, failed: 0 },
  getRequest: vi.fn().mockReturnValue(null),
  getActions: vi.fn().mockReturnValue({ canRetry: false, canCancel: false, canDelete: true }),
  addTrackRequestMutation: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  addAlbumRequestMutation: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  updateRequestMutation: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  deleteRequestMutation: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  clearCompletedRequestMutation: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  cancelRequestMutation: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  ...overrides,
});

export const createMockUseAlbum = (overrides: Partial<ReturnType<typeof createMockUseAlbum>> = {}) => ({
  albums: [] as Album[],
  isLoading: false,
  refreshAlbums: vi.fn().mockResolvedValue({ data: [] }),
  getActions: vi.fn().mockReturnValue({ canRetry: false, canCancel: false, canDelete: true }),
  update: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  delete: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  retry: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  retryAllFailed: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  deleteAll: {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  },
  isRetryingAll: false,
  isDeletingAll: false,
  ...overrides,
});

export const createMockUseLibrarySummary = (
  overrides: Partial<{
    data: {
      completedTracks: number;
      totalDurationMs: number;
      queuedTracks: number;
      topArtists: Array<{ name: string; count: number }>;
    };
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  }> = {}
) => ({
  data: {
    completedTracks: 0,
    totalDurationMs: 0,
    queuedTracks: 0,
    topArtists: [],
  },
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});

export const createMockUseCategories = (
  overrides: Partial<{
    data: { categories: { items: Array<{ id: string; name: string; icons: Array<{ url: string }> }> } };
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  }> = {}
) => ({
  data: { categories: { items: [] } },
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});

export const createMockUseTrendingTracks = (
  overrides: Partial<{
    data: MusicTrack[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  }> = {}
) => ({
  data: [],
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});

export const createMockUseArtistSpotlight = (
  overrides: Partial<{
    data: MusicArtist[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  }> = {}
) => ({
  data: [],
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});

export const createMockUseSearchContent = (
  overrides: Partial<{
    data: {
      tracks?: { items: MusicTrack[] };
      albums?: { items: MusicAlbum[] };
      artists?: { items: MusicArtist[] };
      playlists?: { items: MusicPlaylist[] };
    };
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  }> = {}
) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});
