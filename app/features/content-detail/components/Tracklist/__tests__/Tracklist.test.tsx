import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

import { ContentDetailActionsProvider } from "../../../ContentDetailActionsContext";
import type { ContentDetailActions } from "../../../types";
import type { TracklistTrack } from "../types";
import { Tracklist } from "../Tracklist";

vi.mock("@hooks/api", () => ({
  useRetryTracks: () => ({ isPending: false, variables: undefined, mutate: vi.fn() }),
}));

function createTrack(overrides?: Partial<TracklistTrack>): TracklistTrack {
  return {
    externalId: "t1",
    title: "Get Lucky",
    artist: "Daft Punk",
    durationMs: 369000,
    trackNumber: 8,
    plays: null,
    album: { externalId: "a1", name: "Discovery", cover: "https://img/a1" },
    inLibrary: false,
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
    ...overrides,
  };
}

function renderTracklist(tracks: TracklistTrack[]) {
  const requestTrack = vi.fn();
  const actions: ContentDetailActions = {
    requestAlbum: vi.fn(),
    requestArtist: vi.fn(),
    requestTrack,
    requestPlaylist: vi.fn(),
  };

  renderWithProviders(
    <ContentDetailActionsProvider actions={actions}>
      <Tracklist tracks={tracks} showArtist />
    </ContentDetailActionsProvider>
  );

  return requestTrack;
}

describe("Tracklist", () => {
  it("requests a track with the album the row carries, which is what identifies it to the catalog", async () => {
    const user = userEvent.setup();
    const requestTrack = renderTracklist([createTrack()]);

    await user.click(screen.getByRole("button", { name: /Get Lucky/i }));

    expect(requestTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        album: { externalId: "a1", name: "Discovery", cover: "https://img/a1" },
      })
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

    await user.click(screen.getByRole("button", { name: /Aerodynamic/i }));

    expect(requestTrack).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t2", album: { externalId: "a2", name: "Homework", cover: null } })
    );
  });

  it("passes a null album through untouched when the row genuinely has none", async () => {
    const user = userEvent.setup();
    const requestTrack = renderTracklist([createTrack({ album: null })]);

    await user.click(screen.getByRole("button", { name: /Get Lucky/i }));

    expect(requestTrack).toHaveBeenCalledWith(expect.objectContaining({ album: null }));
  });
});
