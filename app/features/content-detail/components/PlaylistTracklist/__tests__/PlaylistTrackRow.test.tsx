import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import type { TracklistTrack } from "../../Tracklist/types";
import { PlaylistTrackRow } from "../PlaylistTrackRow";
import type { PlaylistTrackRowProps } from "../types";

const COVER = "https://example.com/discovery.jpg";
const PREVIEW = "Play the 30 second preview of Get Lucky";

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
    album: { externalId: "a1", name: "Random Access Memories", cover: COVER },
    inLibrary: false,
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
    ...overrides,
  };
}

function renderRow(overrides?: Partial<PlaylistTrackRowProps>) {
  return renderWithProviders(
    <ul>
      <PlaylistTrackRow
        track={createTrack()}
        position={0}
        presence="absent"
        onRetry={vi.fn()}
        isRetrying={false}
        {...overrides}
      />
    </ul>
  );
}

function coverOf(control: HTMLElement): HTMLImageElement | null {
  return control.parentElement?.querySelector("img") ?? null;
}

beforeEach(() => {
  FakeAudio.reset();
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  resetTrackPreview();
  vi.unstubAllGlobals();
});

describe("PlaylistTrackRow cover", () => {
  it("keeps the cover of a track that has no file and lays the preview over it", async () => {
    const { user } = renderRow();

    const preview = screen.getByRole("button", { name: PREVIEW });
    expect(coverOf(preview)).not.toBeNull();

    await user.click(preview);
    act(() => FakeAudio.only().emit("playing"));

    const stop = screen.getByRole("button", { name: "Stop the preview of Get Lucky" });
    expect(coverOf(stop)).not.toBeNull();
  });

  it("shows the track's initials under the preview when it has no cover", () => {
    renderRow({ track: createTrack({ album: null }) });

    const preview = screen.getByRole("button", { name: PREVIEW });
    expect(coverOf(preview)).toBeNull();
    expect(preview.parentElement).toHaveTextContent("GL");
  });

  it("plays from the cover and offers no preview for a track the library holds", () => {
    renderRow({ track: createTrack({ inLibrary: true }), onPlay: vi.fn(async () => true) });

    expect(screen.queryByRole("button", { name: PREVIEW })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play Get Lucky now" }).querySelector("img")).not.toBeNull();
  });

  it("puts nothing over the cover of a track with neither a file nor a preview", () => {
    const { container } = renderRow({ track: createTrack({ hasPreview: false }) });

    expect(screen.queryByRole("button", { name: /preview/i })).not.toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeNull();
  });
});
