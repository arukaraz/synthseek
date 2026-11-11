import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TracklistTrack } from "../../components/Tracklist/types";

const api = vi.hoisted(() => {
  const state: { tracks: TracklistTrack[] | undefined } = { tracks: undefined };
  return state;
});
const actions = vi.hoisted(() => ({ requestTopTracks: vi.fn() }));
const auth = vi.hoisted(() => ({ role: "admin" }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { role: auth.role } }),
}));

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
    hasPreview: true,
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
  auth.role = "admin";
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

    await user.click(screen.getByRole("button", { name: "Request top tracks: *NSYNC" }));

    expect(actions.requestTopTracks).toHaveBeenCalledTimes(1);
    const [input, intent] = actions.requestTopTracks.mock.calls[0];
    expect(input.artist).toEqual(artist);
    expect(input.tracks.map((row: TracklistTrack) => row.externalId)).toEqual(["new", "failed"]);
    expect(intent).toBe("direct");
  });

  it("customizes the same missing top tracks from the second half of the button", async () => {
    api.tracks = [track("new", null), track("done", "complete")];
    const user = userEvent.setup();
    render(<ArtistTopTracksWidget artist={artist} />);

    await user.click(screen.getByRole("button", { name: "Request *NSYNC with custom settings" }));

    expect(actions.requestTopTracks).toHaveBeenCalledTimes(1);
    const [input, intent] = actions.requestTopTracks.mock.calls[0];
    expect(input.tracks.map((row: TracklistTrack) => row.externalId)).toEqual(["new"]);
    expect(intent).toBe("customize");
  });

  it("gives a member only the direct half", () => {
    auth.role = "member";
    api.tracks = [track("new", null)];

    render(<ArtistTopTracksWidget artist={artist} />);

    expect(screen.getByRole("button", { name: "Request top tracks: *NSYNC" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request *NSYNC with custom settings" })).not.toBeInTheDocument();
  });

  it("offers no request once every top track is in the library or on its way", () => {
    api.tracks = [track("done", "complete"), track("busy", "downloading")];

    render(<ArtistTopTracksWidget artist={artist} />);

    expect(screen.queryByRole("button", { name: "Request top tracks: *NSYNC" })).not.toBeInTheDocument();
  });
});
