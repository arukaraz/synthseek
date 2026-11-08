import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LibraryCountsResult } from "@hooks/api/queries/library/types";
import { renderWithProviders, screen } from "@test/test-utils";
import enLibrary from "@modules/i18n/messages/en/library.json";

const counts = vi.hoisted((): { data: LibraryCountsResult | undefined } => ({ data: undefined }));

vi.mock("@hooks/api", () => ({
  useLibraryCounts: () => ({ data: counts.data }),
}));

import { ShelfViewPills } from "../ShelfViewPills";

const tabs = enLibrary.page.tabs;

describe("ShelfViewPills", () => {
  beforeEach(() => {
    counts.data = undefined;
  });

  it("offers one tab per view and selects the current one", () => {
    renderWithProviders(<ShelfViewPills view="albums" onViewChange={vi.fn()} />);

    expect(screen.getByRole("tablist", { name: tabs.label })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tab", { name: tabs.albums })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: tabs.tracks })).toHaveAttribute("aria-selected", "false");
  });

  it("shows each view's count once the counts load", () => {
    counts.data = { tracks: 1200, albums: 3, artists: 2, playlists: 0 };
    renderWithProviders(<ShelfViewPills view="tracks" onViewChange={vi.fn()} />);

    const [tracks, , , playlists] = screen.getAllByRole("tab");
    expect(tracks).toHaveTextContent(`${tabs.tracks}1,200`);
    expect(playlists).toHaveTextContent(`${tabs.playlists}0`);
  });

  it("shows no count before the counts load", () => {
    renderWithProviders(<ShelfViewPills view="tracks" onViewChange={vi.fn()} />);

    expect(screen.getByRole("tab", { name: tabs.tracks })).toHaveTextContent(new RegExp(`^${tabs.tracks}$`));
  });

  it("switches to the view whose tab is clicked", async () => {
    const onViewChange = vi.fn();
    const { user } = renderWithProviders(<ShelfViewPills view="tracks" onViewChange={onViewChange} />);

    await user.click(screen.getByRole("tab", { name: tabs.artists }));

    expect(onViewChange).toHaveBeenCalledWith("artists");
  });
});
