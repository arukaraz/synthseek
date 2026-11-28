import { describe, expect, it, vi } from "vitest";

import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { expectNoAxeViolations } from "@test/a11y/axe";
import { renderWithProviders, screen, within } from "@test/test-utils";

import { useLibrarySelection } from "../../../hooks/useLibrarySelection";
import { LibraryTrackRows } from "../LibraryTrackRows";

vi.mock("../../LibraryTable/cells/TrackActionsCell", () => ({
  TrackActionsCell: ({ item }: { item: LibraryTrackItem }) => (
    <button type="button" aria-label={`More actions for ${item.title}`}>
      More
    </button>
  ),
}));

function createTrack(id: string, title: string, playable = true): LibraryTrackItem {
  return {
    id,
    external_id: `ext-${id}`,
    title,
    artist: "Daft Punk",
    status: "complete",
    source: "deezer",
    format: "flac",
    request_type: "track",
    bitrate: 1411,
    file_bitrate: null,
    file_format: null,
    playable,
    sources: [],
    duration_ms: 212000,
    track_number: 3,
    disc_number: 1,
    explicit: false,
    album_id: "alb-1",
    albumName: "Discovery",
    albumArt: null,
    genres: [],
    playlistIds: [],
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    libraryPath: null,
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    completed_at: null,
  };
}

const ITEMS = [createTrack("t1", "Aerodynamic"), createTrack("t2", "Digital Love"), createTrack("t3", "Veridis Quo")];

interface HarnessProps {
  total?: number;
  selecting?: boolean;
  onPlay?: (trackId: string) => void;
  items?: LibraryTrackItem[];
}

function Harness({ total, selecting = false, onPlay = vi.fn(), items = ITEMS }: HarnessProps) {
  const selection = useLibrarySelection();
  return (
    <LibraryTrackRows
      items={items}
      total={total}
      selection={selection}
      selecting={selecting}
      onPlay={onPlay}
      onEnqueue={vi.fn(async () => true)}
      onSearchBetterQuality={vi.fn()}
      fileActions={{ canMove: true, openMove: vi.fn(), openDelete: vi.fn() }}
    />
  );
}

const INTERACTIVE = "button, a[href], input, select, textarea, [role=button], [role=checkbox], [role=menuitem]";

function rowOf(title: string): HTMLElement {
  const item = screen.getByRole("button", { name: `Play ${title}` }).closest("li");
  if (item === null) throw new Error(`The row of ${title} is not a list item`);
  return item;
}

describe("LibraryTrackRows structure", () => {
  it("never puts an interactive element inside another", () => {
    renderWithProviders(<Harness />);

    const controls = Array.from(screen.getByRole("list", { name: "Tracks" }).querySelectorAll(INTERACTIVE));

    expect(controls.length).toBeGreaterThan(0);
    for (const control of controls) {
      expect(control.querySelector(INTERACTIVE)).toBeNull();
    }
  });

  it("leaves the row itself as a plain list item with no role and no tab stop", () => {
    renderWithProviders(<Harness />);

    const row = rowOf("Aerodynamic");

    expect(row).not.toHaveAttribute("role");
    expect(row).not.toHaveAttribute("tabindex");
    expect(row).not.toHaveAttribute("aria-label");
  });

  it("names the row's one primary control after what it does and the track", () => {
    renderWithProviders(<Harness />);

    const row = rowOf("Digital Love");
    const buttons = within(row).getAllByRole("button");

    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "Play Digital Love",
      "More actions for Digital Love",
    ]);
  });

  it("plays from a click anywhere on the row and from the primary control with the keyboard, once each", async () => {
    const onPlay = vi.fn();
    const { user } = renderWithProviders(<Harness onPlay={onPlay} />);

    await user.click(screen.getAllByText(/^Daft Punk/, { selector: "p" })[0]);
    expect(onPlay).toHaveBeenCalledTimes(1);

    screen.getByRole("button", { name: "Play Digital Love" }).focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onPlay).toHaveBeenCalledTimes(3);
    expect(onPlay).toHaveBeenLastCalledWith("t2");
  });

  it("does not play when the row's own action button is pressed", async () => {
    const onPlay = vi.fn();
    const { user } = renderWithProviders(<Harness onPlay={onPlay} />);

    await user.click(screen.getByRole("button", { name: "More actions for Aerodynamic" }));

    expect(onPlay).not.toHaveBeenCalled();
  });

  it("offers no primary control on a row with nothing to play and nothing selected", () => {
    renderWithProviders(<Harness items={[createTrack("t9", "Silent", false)]} />);

    expect(screen.queryByRole("button", { name: "Play Silent" })).not.toBeInTheDocument();
    expect(screen.getByText("Silent")).toBeInTheDocument();
  });

  it("turns the primary control into a toggle that reports whether the row is picked while selecting", async () => {
    const { user } = renderWithProviders(<Harness selecting />);
    const toggle = screen.getByRole("button", { name: "Select Aerodynamic" });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});

describe("LibraryTrackRows set size and position", () => {
  it("tells a reader the whole list is longer than what has been loaded", () => {
    renderWithProviders(<Harness total={120} />);

    const rows = screen.getAllByRole("listitem");

    expect(rows.map((row) => row.getAttribute("aria-setsize"))).toEqual(["120", "120", "120"]);
    expect(rows.map((row) => row.getAttribute("aria-posinset"))).toEqual(["1", "2", "3"]);
  });

  it("falls back to the loaded count when no total is known", () => {
    renderWithProviders(<Harness />);

    expect(screen.getAllByRole("listitem").map((row) => row.getAttribute("aria-setsize"))).toEqual(["3", "3", "3"]);
  });

  it("never claims a set smaller than the position it reports", () => {
    renderWithProviders(<Harness total={1} />);

    const last = screen.getAllByRole("listitem")[2];

    expect(last).toHaveAttribute("aria-posinset", "3");
    expect(last).toHaveAttribute("aria-setsize", "3");
  });
});

describe("LibraryTrackRows axe", () => {
  it("has no violation in a list of tracks", async () => {
    renderWithProviders(<Harness />);

    await expectNoAxeViolations();
  });

  it("has no violation while selecting", async () => {
    renderWithProviders(<Harness selecting />);

    await expectNoAxeViolations();
  });
});
