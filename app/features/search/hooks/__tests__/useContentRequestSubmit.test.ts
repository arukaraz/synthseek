import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMusicAlbum, createMusicArtist, createMusicPlaylist, createMusicTrack } from "@test/factories";

import type { AlbumDelegate } from "../../components/ConfigRequestModal/types";
import type { RequestConfigInput } from "../types";
import { useContentRequestSubmit } from "../useContentRequestSubmit";

const spies = vi.hoisted(() => ({
  single: vi.fn(),
  album: vi.fn(),
  playlist: vi.fn(),
  tracks: vi.fn(),
  tracksName: { read: (): string => "" },
}));

vi.mock("@hooks/api", () => ({
  useRequest: () => ({ mutate: spies.single, isPending: false }),
  useBatchRequest: () => ({ mutate: spies.album, isPending: false }),
  usePlaylistRequest: () => ({ mutate: spies.playlist, isPending: false }),
  useRequestTracks: (nameOf: () => string) => {
    spies.tracksName.read = nameOf;
    return { mutate: spies.tracks, isPending: false };
  },
}));

const CONFIG: RequestConfigInput = {
  bitrate: { value: 256, matching: "strict" },
  format: { value: "flac", matching: "flexible" },
};

const tracks = [createMusicTrack({ id: "t1" }), createMusicTrack({ id: "t2" })];

beforeEach(() => {
  vi.clearAllMocks();
});

function submitter() {
  return renderHook(() => useContentRequestSubmit()).result.current.submit;
}

describe("useContentRequestSubmit", () => {
  it("leaves the config out when none was chosen, so the server applies the preset", () => {
    const track = createMusicTrack({ id: "single" });

    expect(submitter()({ item: track, mode: "download", tracks: [] })).toBe("sent");

    expect(spies.single).toHaveBeenCalledTimes(1);
    expect(spies.single.mock.calls[0]?.[0]).not.toHaveProperty("config");
  });

  it("sends the chosen config and destination with a track", () => {
    const track = createMusicTrack({ id: "single" });

    submitter()({ item: track, mode: "download", tracks: [], config: CONFIG, destinationPathId: "path-2" });

    expect(spies.single).toHaveBeenCalledWith(
      expect.objectContaining({ config: CONFIG, destinationPathId: "path-2", album_external_id: track.album.id })
    );
  });

  it("refuses an album with no tracks", () => {
    expect(submitter()({ item: createMusicAlbum(), mode: "download", tracks: [] })).toBe("noTracks");
    expect(spies.album).not.toHaveBeenCalled();
  });

  it("sends an album with its tracks and its Lidarr handoff", () => {
    const delegate: AlbumDelegate = {
      manager: "lidarr",
      rootFolderPath: "/music",
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: "album",
      tags: [],
    };

    submitter()({ item: createMusicAlbum({ id: "album-1" }), mode: "download", tracks, delegate });

    expect(spies.album).toHaveBeenCalledWith(
      expect.objectContaining({ external_id: "album-1", delegate, tracks: expect.any(Array) })
    );
    expect(spies.album.mock.calls[0]?.[0].tracks).toHaveLength(2);
  });

  it("names a playlist by the rename when there is one", () => {
    const playlist = createMusicPlaylist({ name: "Original" });

    submitter()({ item: playlist, mode: "download", tracks, playlistName: "  Renamed  " });

    expect(spies.playlist).toHaveBeenCalledWith(expect.objectContaining({ name: "Renamed" }));
  });

  it("sends an artist's top tracks one by one, each with its own album, under the artist's name", () => {
    const artist = createMusicArtist({ name: "Top" });

    submitter()({ item: artist, mode: "artist-tracks", tracks, config: CONFIG });

    expect(spies.tracks).toHaveBeenCalledWith({
      tracks: tracks.map((track) => expect.objectContaining({ album_external_id: track.album.id })),
      config: CONFIG,
    });
    expect(spies.tracksName.read()).toContain("Top");
  });
});
