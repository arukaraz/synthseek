import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { WatchCapabilities } from "../../types";

const dropdown = vi.hoisted(() => ({ filterValues: [] as string[] }));

vi.mock("@components/ui/FilterSortDropdown", () => ({
  FilterSortDropdown: (props: { filter: { options: ReadonlyArray<{ value: string }> } }) => {
    dropdown.filterValues = props.filter.options.map((option) => option.value);
    return <div data-testid="filter-sort" />;
  },
}));

vi.mock("../AutoWatchToggles", () => ({
  AutoWatchToggles: (props: { providerName: string }) => (
    <div data-testid="auto-watch" data-provider={props.providerName} />
  ),
}));

import { ModalToolbar } from "../ModalToolbar";

function renderToolbar(itemTypes: ReadonlyArray<"playlist" | "album" | "liked">, watch: WatchCapabilities) {
  render(
    <ModalToolbar
      providerName="Navidrome"
      itemTypes={itemTypes}
      watch={watch}
      filter="all"
      onFilterChange={vi.fn()}
      sort="type"
      onSortChange={vi.fn()}
      direction="desc"
      onDirectionChange={vi.fn()}
      search=""
      onSearchChange={vi.fn()}
      autoWatch={{ playlists: false, savedAlbums: false }}
      onWatchChange={vi.fn()}
    />
  );
}

describe("ModalToolbar", () => {
  it("filters only by the item types the source offers", () => {
    renderToolbar(["playlist"], { playlists: true, savedAlbums: false });

    expect(dropdown.filterValues).toEqual(["all", "playlists"]);
  });

  it("offers the auto-import control under the source's name when the source can be watched", () => {
    renderToolbar(["playlist"], { playlists: true, savedAlbums: false });

    expect(screen.getByTestId("auto-watch")).toHaveAttribute("data-provider", "Navidrome");
  });

  it("hides the auto-import control for a source that cannot be watched", () => {
    renderToolbar(["playlist"], { playlists: false, savedAlbums: false });

    expect(screen.queryByTestId("auto-watch")).not.toBeInTheDocument();
  });
});
