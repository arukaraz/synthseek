import { describe, it, expect, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

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
  it("renders the sheet title and the embedded sidebar when open", () => {
    renderWithProviders(<LibraryFilterSheet {...makeProps()} />);

    expect(screen.getAllByText("page.filters.title").length).toBeGreaterThan(0);
  });

  it("does not render its dialog content when closed", () => {
    renderWithProviders(<LibraryFilterSheet {...makeProps({ open: false })} />);

    expect(screen.queryByText("page.filters.done")).not.toBeInTheDocument();
  });

  it("closes the sheet when the done button is clicked", async () => {
    const onOpenChange = vi.fn();
    const { user } = renderWithProviders(<LibraryFilterSheet {...makeProps({ onOpenChange })} />);

    await user.click(screen.getByRole("button", { name: "page.filters.done" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
