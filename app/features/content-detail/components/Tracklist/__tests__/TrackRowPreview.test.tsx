import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PreviewAnnouncer } from "@components/ui/PreviewButton";
import { FakeAudio } from "@test/mocks/audio.mock";
import { renderWithProviders, screen } from "@test/test-utils";

vi.mock("@hooks/ui/player", () => ({
  playerActions: { pauseHere: vi.fn(), resumeHere: vi.fn() },
  playerSnapshot: () => ({ playing: false, volume: 1, muted: false }),
  subscribePlayer: () => () => undefined,
}));
vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { role: "admin" } }),
}));

import { resetTrackPreview } from "@hooks/ui/trackPreview/store";

import { TrackRow } from "../TrackRow";
import type { TracklistTrack } from "../types";

function createTrack(overrides?: Partial<TracklistTrack>): TracklistTrack {
  return {
    externalId: "t1",
    title: "Get Lucky",
    artist: "Daft Punk",
    artistExternalId: "27",
    durationMs: 369000,
    trackNumber: 8,
    plays: null,
    hasPreview: true,
    album: null,
    inLibrary: false,
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
    ...overrides,
  };
}

const noop = () => {};

function renderRows(tracks: TracklistTrack[]) {
  return renderWithProviders(
    <>
      <ul>
        {tracks.map((track) => (
          <TrackRow
            key={track.externalId}
            track={track}
            showArtist
            onRequest={noop}
            onCustomizeRequest={noop}
            onRetry={noop}
            isRetrying={false}
          />
        ))}
      </ul>
      <PreviewAnnouncer />
    </>
  );
}

beforeEach(() => {
  FakeAudio.reset();
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  resetTrackPreview();
  vi.unstubAllGlobals();
});

describe("the preview on a track row", () => {
  it("swaps the track's length for the preview clock while it sounds, and back when it ends", async () => {
    const { user } = renderRows([createTrack()]);
    expect(screen.getByText("6:09")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Play the 30 second preview of Get Lucky" }));
    act(() => FakeAudio.only().emit("playing"));

    expect(screen.getByText("0:00 / 0:30")).toBeInTheDocument();
    expect(screen.queryByText("6:09")).not.toBeInTheDocument();

    act(() => FakeAudio.only().emit("ended"));

    expect(screen.getByText("6:09")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("The preview of Get Lucky finished.");
  });

  it("moves the one sound to the next row pressed", async () => {
    const { user } = renderRows([createTrack(), createTrack({ externalId: "t2", title: "Contact" })]);

    await user.click(screen.getByRole("button", { name: "Play the 30 second preview of Get Lucky" }));
    await user.click(screen.getByRole("button", { name: "Play the 30 second preview of Contact" }));

    expect(FakeAudio.made).toHaveLength(1);
    expect(FakeAudio.only().src).toBe("/api/v1/catalog/tracks/t2/preview");
    expect(screen.getByRole("button", { name: "Play the 30 second preview of Get Lucky" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop the preview of Contact" })).toBeInTheDocument();
  });

  it("says a row has no preview where its length would be", () => {
    renderRows([createTrack({ hasPreview: false })]);

    expect(screen.getByText("No preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No preview available for Get Lucky" })).toBeInTheDocument();
  });

  it("warns on the row when the preview fails to load, and announces it", async () => {
    const { user } = renderRows([createTrack()]);

    await user.click(screen.getByRole("button", { name: "Play the 30 second preview of Get Lucky" }));
    act(() => FakeAudio.only().emit("error"));

    expect(screen.getByText("Couldn't load")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview unavailable: Get Lucky" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't load the preview of Get Lucky.");
  });
});
