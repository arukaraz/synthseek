import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TracklistTrack } from "../../components/Tracklist/types";

const api = vi.hoisted(() => {
  const state: { tracks: TracklistTrack[] | undefined } = { tracks: undefined };
  return state;
});
const actions = vi.hoisted(() => ({ requestTopTracks: vi.fn() }));

vi.mock("@hooks/api/queries/content-detail", () => ({
  useArtistTopTracks: () => ({ data: api.tracks, isLoading: false }),
}));

vi.mock("../../ContentDetailActionsContext", () => ({
  useContentDetailActions: () => ({ requestTopTracks: actions.requestTopTracks }),
}));

vi.mock("../../components/Tracklist", () => ({
  Tracklist: ({ tracks }: { tracks: TracklistTrack[] }) => (
    <ul>
      {tracks.map((track) => (
        <li key={track.externalId}>{track.title}</li>
      ))}
    </ul>
  ),
}));

import { ArtistTopTracksWidget } from "../ArtistTopTracksWidget";

const artist = { id: "520", name: "*NSYNC", cover: "/nsync.jpg" };

function track(externalId: string, status: TracklistTrack["status"]): TracklistTrack {
  return {
    externalId,
    title: `Track ${externalId}`,
    artist: "*NSYNC",
    artistExternalId: "520",
    durationMs: 200000,
    trackNumber: 1,
    plays: null,
    album: { externalId: "alb", name: "No Strings Attached", cover: null },
    inLibrary: status === "complete",
    requestId: status === null ? null : `req-${externalId}`,
    slskd_request_id: null,
    status,
    failureReason: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.tracks = undefined;
});

describe("the top tracks section", () => {
  it("requests the top tracks that are not in the library or on their way, for this artist", async () => {
    api.tracks = [
      track("new", null),
      track("done", "complete"),
      track("busy", "downloading"),
      track("failed", "failed"),
    ];
    const user = userEvent.setup();
    render(<ArtistTopTracksWidget artist={artist} />);

    await user.click(screen.getByRole("button", { name: "Request top tracks" }));

    expect(actions.requestTopTracks).toHaveBeenCalledTimes(1);
    const input = actions.requestTopTracks.mock.calls[0][0];
    expect(input.artist).toEqual(artist);
    expect(input.tracks.map((row: TracklistTrack) => row.externalId)).toEqual(["new", "failed"]);
  });

  it("offers no request once every top track is in the library or on its way", () => {
    api.tracks = [track("done", "complete"), track("busy", "downloading")];

    render(<ArtistTopTracksWidget artist={artist} />);

    expect(screen.queryByRole("button", { name: "Request top tracks" })).not.toBeInTheDocument();
  });
});
