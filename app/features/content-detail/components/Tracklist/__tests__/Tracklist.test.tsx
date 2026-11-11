import { beforeEach, describe, expect, it, vi } from "vitest";

import { STAGE_WIDE_QUERY } from "@components/Player/constants";
import { renderWithProviders, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

import { ContentDetailActionsProvider } from "../../../ContentDetailActionsContext";
import { ContentDetailCloseProvider } from "../../../ContentDetailCloseContext";
import type { ContentDetailActions } from "../../../types";
import type { TracklistTrack } from "../types";
import { Tracklist } from "../Tracklist";

const { playback, stage, media } = vi.hoisted(() => ({
  playback: { playEntity: vi.fn(async () => true), enqueueEntity: vi.fn(async () => true) },
  stage: { openStage: vi.fn(), removeTrackFromQueue: vi.fn() },
  media: { wide: true },
}));

vi.mock("@hooks/api", () => ({
  useRetryTracks: () => ({ isPending: false, variables: undefined, mutate: vi.fn() }),
}));
vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { role: "admin" } }),
}));
vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => playback }));
vi.mock("@hooks/ui/player", () => ({ playerActions: stage, useQueuePresence: () => () => "absent" }));
vi.mock("@hooks/ui/useMediaQuery", () => ({
  useMediaQuery: (query: string) => query === STAGE_WIDE_QUERY && media.wide,
}));

beforeEach(() => {
  vi.clearAllMocks();
  media.wide = true;
});

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
    album: { externalId: "a1", name: "Discovery", cover: "https://img/a1" },
    inLibrary: false,
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
    ...overrides,
  };
}

function renderTracklist(tracks: TracklistTrack[], onClose = vi.fn()) {
  const requestTrack = vi.fn();
  const actions: ContentDetailActions = {
    requestAlbum: vi.fn(),
    requestArtist: vi.fn(),
    requestTrack,
    requestPlaylist: vi.fn(),
    requestTopTracks: vi.fn(),
  };

  renderWithProviders(
    <ContentDetailActionsProvider actions={actions}>
      <ContentDetailCloseProvider onClose={onClose}>
        <Tracklist tracks={tracks} showArtist />
      </ContentDetailCloseProvider>
    </ContentDetailActionsProvider>
  );

  return requestTrack;
}

describe("Tracklist", () => {
  it("requests a track with the album the row carries, which is what identifies it to the catalog", async () => {
    const user = userEvent.setup();
    const requestTrack = renderTracklist([createTrack()]);

    await user.click(screen.getByRole("button", { name: "Request Get Lucky" }));

    expect(requestTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        album: { externalId: "a1", name: "Discovery", cover: "https://img/a1" },
      }),
      "direct"
    );
  });

  it("opens the custom settings for the same track from the second half of the button", async () => {
    const user = userEvent.setup();
    const requestTrack = renderTracklist([createTrack()]);

    await user.click(screen.getByRole("button", { name: "Request Get Lucky with custom settings" }));

    expect(requestTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        album: { externalId: "a1", name: "Discovery", cover: "https://img/a1" },
      }),
      "customize"
    );
  });

  it("gives each row its own album rather than one shared context, so a mixed list stays correct", async () => {
    const user = userEvent.setup();
    const requestTrack = renderTracklist([
      createTrack(),
      createTrack({
        externalId: "t2",
        title: "Aerodynamic",
        album: { externalId: "a2", name: "Homework", cover: null },
      }),
    ]);

    await user.click(screen.getByRole("button", { name: "Request Aerodynamic" }));

    expect(requestTrack).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t2", album: { externalId: "a2", name: "Homework", cover: null } }),
      "direct"
    );
  });

  it("closes the modal and opens the full screen player when a row is played on a phone", async () => {
    media.wide = false;
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderTracklist([createTrack({ requestId: "req_1", status: "complete" })], onClose);

    await user.click(screen.getByRole("button", { name: /Play Get Lucky now/i }));

    expect(playback.playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["req_1"] });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(stage.openStage).toHaveBeenCalledTimes(1);
  });

  it("keeps the modal open when a row is played on a wide screen", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderTracklist([createTrack({ requestId: "req_1", status: "complete" })], onClose);

    await user.click(screen.getByRole("button", { name: /Play Get Lucky now/i }));

    expect(playback.playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["req_1"] });
    expect(onClose).not.toHaveBeenCalled();
    expect(stage.openStage).not.toHaveBeenCalled();
  });

  it("passes a null album through untouched when the row genuinely has none", async () => {
    const user = userEvent.setup();
    const requestTrack = renderTracklist([createTrack({ album: null })]);

    await user.click(screen.getByRole("button", { name: "Request Get Lucky" }));

    expect(requestTrack).toHaveBeenCalledWith(expect.objectContaining({ album: null }), "direct");
  });
});
