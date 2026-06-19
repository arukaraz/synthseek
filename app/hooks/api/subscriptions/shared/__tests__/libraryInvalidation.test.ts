import { describe, it, expect, vi } from "vitest";

import { trpc } from "@utils/trpc";
import { invalidateLibraryViews } from "../libraryInvalidation";

const spies = vi.hoisted(() => ({
  getAlbums: vi.fn(),
  getArtists: vi.fn(),
  getPlaylists: vi.fn(),
  getTracks: vi.fn(),
  getCounts: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      library: {
        getAlbums: { invalidate: spies.getAlbums },
        getArtists: { invalidate: spies.getArtists },
        getPlaylists: { invalidate: spies.getPlaylists },
        getTracks: { invalidate: spies.getTracks },
        getCounts: { invalidate: spies.getCounts },
      },
    }),
  },
}));

describe("invalidateLibraryViews", () => {
  it("invalidates every library view query exactly once", () => {
    const utils = trpc.useUtils();
    invalidateLibraryViews(utils);
    expect(spies.getAlbums).toHaveBeenCalledTimes(1);
    expect(spies.getArtists).toHaveBeenCalledTimes(1);
    expect(spies.getPlaylists).toHaveBeenCalledTimes(1);
    expect(spies.getTracks).toHaveBeenCalledTimes(1);
    expect(spies.getCounts).toHaveBeenCalledTimes(1);
  });
});
