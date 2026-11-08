import { describe, expect, it, vi } from "vitest";

import { createLibraryController, createLibraryShell } from "@test/factories";
import { renderWithProviders, screen, within } from "@test/test-utils";
import enComponents from "@modules/i18n/messages/en/components.json";
import enLibrary from "@modules/i18n/messages/en/library.json";

import { VIEW_CONFIG } from "../../../constants";
import { ShelfControls } from "../ShelfControls";

const page = enLibrary.page;

describe("ShelfControls", () => {
  it("shows how many filters are active and opens the filters on click", async () => {
    const onOpenFilters = vi.fn();
    const controller = createLibraryController({ filters: { genre: ["rock", "jazz"], format: ["flac"] } });
    const { user } = renderWithProviders(
      <ShelfControls controller={controller} onOpenFilters={onOpenFilters} shell={createLibraryShell()} />
    );

    const chip = screen.getByRole("button", { name: page.toolbar.openFilters });
    expect(within(chip).getByText("3")).toBeInTheDocument();

    await user.click(chip);

    expect(onOpenFilters).toHaveBeenCalledTimes(1);
  });

  it("shows no count on the filters chip when nothing is filtered", () => {
    renderWithProviders(
      <ShelfControls controller={createLibraryController()} onOpenFilters={vi.fn()} shell={createLibraryShell()} />
    );

    expect(screen.getByRole("button", { name: page.toolbar.openFilters })).toHaveTextContent(
      new RegExp(`^${page.toolbar.openFilters}$`)
    );
  });

  it("names the current sort on its chip and opens the sort sheet from it", async () => {
    const controller = createLibraryController({ sort: "oldest", effectiveDirection: "asc" });
    const { user } = renderWithProviders(
      <ShelfControls controller={controller} onOpenFilters={vi.fn()} shell={createLibraryShell()} />
    );

    const chip = screen.getByRole("button", { name: page.toolbar.sortAria });
    expect(chip).toHaveTextContent(page.sort.oldest);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(chip);

    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByText(enComponents.filterSort.sortLabel)).toBeInTheDocument();
  });

  it("falls back to the generic sort label when the sort is not one of the view's options", () => {
    renderWithProviders(
      <ShelfControls
        controller={createLibraryController({ sort: "unknown" })}
        onOpenFilters={vi.fn()}
        shell={createLibraryShell()}
      />
    );

    expect(screen.getByRole("button", { name: page.toolbar.sortAria })).toHaveTextContent(page.toolbar.sort);
  });

  it("offers no layout choice on the tracks table", () => {
    renderWithProviders(
      <ShelfControls controller={createLibraryController()} onOpenFilters={vi.fn()} shell={createLibraryShell()} />
    );

    expect(screen.queryByRole("radiogroup", { name: page.shelf.density })).not.toBeInTheDocument();
  });

  it("offers the grid layouts on a grid view, checks the current one and switches on click", async () => {
    const shell = createLibraryShell({ density: "compact" });
    const controller = createLibraryController({ view: "artists", config: VIEW_CONFIG.artists });
    const { user } = renderWithProviders(
      <ShelfControls controller={controller} onOpenFilters={vi.fn()} shell={shell} />
    );

    const group = screen.getByRole("radiogroup", { name: page.shelf.density });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    expect(within(group).getByRole("radio", { name: page.shelf.compact })).toHaveAttribute("aria-checked", "true");
    expect(within(group).getByRole("radio", { name: page.shelf.comfortable })).toHaveAttribute("aria-checked", "false");

    await user.click(within(group).getByRole("radio", { name: page.shelf.list }));

    expect(shell.onDensityChange).toHaveBeenCalledWith("list");
  });

  it("offers no select toggle on artists or playlists", () => {
    const { rerender } = renderWithProviders(
      <ShelfControls
        controller={createLibraryController({ view: "artists", config: VIEW_CONFIG.artists })}
        onOpenFilters={vi.fn()}
        shell={createLibraryShell()}
      />
    );
    expect(screen.queryByRole("button", { name: page.shelf.selectMode })).not.toBeInTheDocument();

    rerender(
      <ShelfControls
        controller={createLibraryController({ view: "playlists", config: VIEW_CONFIG.playlists })}
        onOpenFilters={vi.fn()}
        shell={createLibraryShell()}
      />
    );
    expect(screen.queryByRole("button", { name: page.shelf.selectMode })).not.toBeInTheDocument();
  });

  it("turns select mode on from the albums view", async () => {
    const shell = createLibraryShell({ selectMode: false });
    const controller = createLibraryController({ view: "albums", config: VIEW_CONFIG.albums });
    const { user } = renderWithProviders(
      <ShelfControls controller={controller} onOpenFilters={vi.fn()} shell={shell} />
    );

    const toggle = screen.getByRole("button", { name: page.shelf.selectMode });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(shell.onSelectModeChange).toHaveBeenCalledWith(true);
  });

  it("turns select mode off from the tracks view when it is on", async () => {
    const shell = createLibraryShell({ selectMode: true });
    const { user } = renderWithProviders(
      <ShelfControls controller={createLibraryController()} onOpenFilters={vi.fn()} shell={shell} />
    );

    const toggle = screen.getByRole("button", { name: page.shelf.selectMode });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);

    expect(shell.onSelectModeChange).toHaveBeenCalledWith(false);
  });
});
