import { describe, it, expect, vi } from "vitest";

import { renderWithProviders, screen, within } from "@test/test-utils";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { VIEW_CONFIG } from "../../../constants";
import { LibraryFilterSheet } from "../LibraryFilterSheet";
import type { LibraryFilterSheetProps } from "../types";

function makeProps(overrides?: Partial<LibraryFilterSheetProps>): LibraryFilterSheetProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    total: 12,
    config: VIEW_CONFIG.tracks,
    facets: {},
    filters: {},
    facetSearch: {},
    onToggleValue: vi.fn(),
    onOrphanChange: vi.fn(),
    onFacetSearch: vi.fn(),
    onClear: vi.fn(),
    hasActiveFilters: false,
    ...overrides,
  };
}

describe("LibraryFilterSheet", () => {
  it("titles the sheet Filters and names the view underneath while nothing is filtered", () => {
    renderWithProviders(<LibraryFilterSheet {...makeProps()} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "page.filters.title" })).toBeInTheDocument();
    expect(within(dialog).getByText(VIEW_CONFIG.tracks.labelKey)).toBeInTheDocument();
  });

  it("counts the active filters in the subtitle once something is filtered", () => {
    renderWithProviders(
      <LibraryFilterSheet {...makeProps({ filters: { source: ["deezer"] }, hasActiveFilters: true })} />
    );

    expect(screen.getByText("page.shelf.activeFilters")).toBeInTheDocument();
  });

  it("renders no dialog when closed", () => {
    renderWithProviders(<LibraryFilterSheet {...makeProps({ open: false })} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the sheet from the show results button", async () => {
    const onOpenChange = vi.fn();
    const { user } = renderWithProviders(<LibraryFilterSheet {...makeProps({ onOpenChange })} />);

    await user.click(screen.getByRole("button", { name: "page.shelf.showResults" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("offers clear only while a filter is active, and clears through the controller", async () => {
    const onClear = vi.fn();
    const { user, rerender } = renderWithProviders(<LibraryFilterSheet {...makeProps({ onClear })} />);

    expect(screen.getByRole("button", { name: "page.filters.clear" })).toBeDisabled();

    rerender(
      <LibraryFilterSheet {...makeProps({ onClear, filters: { source: ["deezer"] }, hasActiveFilters: true })} />
    );
    await user.click(screen.getByRole("button", { name: "page.filters.clear" }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
