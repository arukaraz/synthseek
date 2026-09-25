import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEnginePlaybackSources: () => update,
}));

import { PlaybackOrderCard } from "../PlaybackOrderCard";

const copy = enSettings.mediaServers.order;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const PLAYING = { plex: true, navidrome: true, jellyfin: false };

describe("PlaybackOrderCard", () => {
  it("lists the library first, then every server in the stored order, marking one that cannot play", () => {
    render(<PlaybackOrderCard order={["navidrome", "plex", "jellyfin"]} playing={PLAYING} />);

    const rows = screen.getAllByRole("listitem").map((row) => row.textContent);
    expect(rows[0]).toContain(copy.local);
    expect(rows.slice(1).map((row) => row?.replace(copy.notPlaying, "").slice(1))).toEqual([
      "Navidrome",
      "Plex",
      "Jellyfin",
    ]);
    expect(rows[3]).toContain(copy.notPlaying);
  });

  it("saves the whole order when a server moves", async () => {
    render(<PlaybackOrderCard order={["plex", "navidrome", "jellyfin"]} playing={PLAYING} />);

    await userEvent.click(screen.getByRole("button", { name: "Move Navidrome up" }));
    expect(update.mutate).toHaveBeenCalledWith({ order: ["navidrome", "plex", "jellyfin"] });

    await userEvent.click(screen.getByRole("button", { name: "Move Navidrome down" }));
    expect(update.mutate).toHaveBeenLastCalledWith({ order: ["plex", "jellyfin", "navidrome"] });
  });

  it("cannot move the first server up or the last one down", () => {
    render(<PlaybackOrderCard order={["plex", "navidrome", "jellyfin"]} playing={PLAYING} />);

    expect(screen.getByRole("button", { name: "Move Plex up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move Jellyfin down" })).toBeDisabled();
  });
});
