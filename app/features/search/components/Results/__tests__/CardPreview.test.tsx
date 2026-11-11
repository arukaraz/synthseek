import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContentType } from "@api/__generated__/types";
import { FakeAudio } from "@test/mocks/audio.mock";
import { createMusicAlbum, createMusicTrack } from "@test/factories";
import { renderWithProviders, screen } from "@test/test-utils";

vi.mock("@hooks/ui/player", () => ({
  playerActions: { pauseHere: vi.fn(), resumeHere: vi.fn() },
  playerSnapshot: () => ({ playing: false, volume: 1, muted: false }),
  subscribePlayer: () => () => undefined,
}));

import { resetTrackPreview } from "@hooks/ui/trackPreview/store";

import { Card } from "../Card";
import { transformResultForDisplay } from "../helpers";
import type { Result } from "../types";

const TRACK: Result = {
  id: "3135556",
  type: ContentType.enum.track,
  name: "One More Time",
  artist: "Daft Punk",
  hasPreview: true,
};

beforeEach(() => {
  FakeAudio.reset();
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  resetTrackPreview();
  vi.unstubAllGlobals();
});

describe("the preview on a search card", () => {
  it("plays the track through the server's preview route without opening the card", async () => {
    const onResultClick = vi.fn();
    const { user } = renderWithProviders(<Card result={TRACK} onResultClick={onResultClick} />);

    await user.click(screen.getByRole("button", { name: "Play the 30 second preview of One More Time" }));

    expect(FakeAudio.only().src).toBe("/api/v1/catalog/tracks/3135556/preview");
    expect(onResultClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Stop the preview of One More Time" })).toBeInTheDocument();
  });

  it("shows the time over the clip length and lights the card once the preview sounds", async () => {
    const { user } = renderWithProviders(<Card result={TRACK} onResultClick={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Play the 30 second preview/ }));
    expect(screen.queryByText("0:00 / 0:30")).not.toBeInTheDocument();
    act(() => FakeAudio.only().emit("playing"));

    expect(screen.getByText("0:00 / 0:30")).toBeInTheDocument();
    expect(document.querySelector('[data-cy="preview-edge"]')).toBeInTheDocument();
  });

  it("stops the preview when the card leaves the screen", async () => {
    const { user, unmount } = renderWithProviders(<Card result={TRACK} onResultClick={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /Play the 30 second preview/ }));

    unmount();

    expect(FakeAudio.only().paused).toBe(true);
    expect(FakeAudio.only().src).toBe("");
  });

  it("keeps the control but locks it for a track the catalog has no preview for", () => {
    renderWithProviders(<Card result={{ ...TRACK, hasPreview: false }} onResultClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: "No preview available for One More Time" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it.each([ContentType.enum.album, ContentType.enum.artist, ContentType.enum.playlist])(
    "puts no preview control on a %s card",
    (type) => {
      renderWithProviders(<Card result={{ ...TRACK, type }} onResultClick={vi.fn()} />);

      expect(screen.queryByRole("button", { name: /preview/i })).not.toBeInTheDocument();
    }
  );
});

describe("transformResultForDisplay", () => {
  it("says a track can be previewed only when the catalog lists a preview for it", () => {
    const withPreview = createMusicTrack({ preview_url: "https://preview.catalog.test/1.mp3" });
    const without = createMusicTrack({ preview_url: null });

    expect(transformResultForDisplay(withPreview).hasPreview).toBe(true);
    expect(transformResultForDisplay(without).hasPreview).toBe(false);
  });

  it("says nothing about previews for an album", () => {
    expect(transformResultForDisplay(createMusicAlbum())).not.toHaveProperty("hasPreview");
  });
});
