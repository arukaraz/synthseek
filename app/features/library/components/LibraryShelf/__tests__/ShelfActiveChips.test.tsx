import { describe, expect, it } from "vitest";

import { createLibraryController } from "@test/factories";
import { renderWithProviders, screen } from "@test/test-utils";
import enLibrary from "@modules/i18n/messages/en/library.json";

import { VIEW_CONFIG } from "../../../constants";
import { ShelfActiveChips } from "../ShelfActiveChips";

const page = enLibrary.page;
const removeLabel = (label: string) => page.shelf.removeFilter.replace("{{label}}", label);
const GENRES = { genre: [{ value: "rock", label: "Rock", count: 3 }] };

describe("ShelfActiveChips", () => {
  it("renders nothing when no filter is active", () => {
    const { container } = renderWithProviders(
      <ShelfActiveChips controller={createLibraryController()} facets={GENRES} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows one chip per active value, named by its facet", () => {
    const controller = createLibraryController({ filters: { genre: ["rock", "jazz"] } });
    renderWithProviders(<ShelfActiveChips controller={controller} facets={GENRES} />);

    expect(screen.getByRole("button", { name: removeLabel("Genre: Rock") })).toHaveTextContent("Genre: Rock");
    expect(screen.getByRole("button", { name: removeLabel("Genre: jazz") })).toBeInTheDocument();
  });

  it("removes only the chip's own value", async () => {
    const controller = createLibraryController({ filters: { genre: ["rock", "jazz"] } });
    const { user } = renderWithProviders(<ShelfActiveChips controller={controller} facets={GENRES} />);

    await user.click(screen.getByRole("button", { name: removeLabel("Genre: Rock") }));

    expect(controller.setFilterValues).toHaveBeenCalledWith("genre", ["jazz"]);
  });

  it("shows the loose-tracks filter on the tracks view and turns it off", async () => {
    const controller = createLibraryController({ filters: { orphan: ["true"] } });
    const { user } = renderWithProviders(<ShelfActiveChips controller={controller} facets={{}} />);

    await user.click(screen.getByRole("button", { name: removeLabel(page.facets.orphan) }));

    expect(controller.setOrphan).toHaveBeenCalledWith(false);
  });

  it("ignores a loose-tracks flag on a view that cannot use it", () => {
    const controller = createLibraryController({
      view: "albums",
      config: VIEW_CONFIG.albums,
      filters: { orphan: ["true"] },
    });
    const { container } = renderWithProviders(<ShelfActiveChips controller={controller} facets={{}} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("clears every filter from the Clear link", async () => {
    const controller = createLibraryController({ filters: { genre: ["rock"] } });
    const { user } = renderWithProviders(<ShelfActiveChips controller={controller} facets={GENRES} />);

    await user.click(screen.getByRole("button", { name: page.filters.clear }));

    expect(controller.clearFilters).toHaveBeenCalledTimes(1);
  });
});
