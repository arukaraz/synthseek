import { describe, it, expect, vi } from "vitest";

import { act, fireEvent, renderWithProviders, screen } from "@test/test-utils";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { VIEW_CONFIG } from "../../../constants";
import { LibraryFilterSidebar } from "../LibraryFilterSidebar";
import type { LibraryFilterSidebarProps } from "../types";

function makeProps(overrides?: Partial<LibraryFilterSidebarProps>): LibraryFilterSidebarProps {
  return {
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

describe("LibraryFilterSidebar", () => {
  it("renders a group for every facet in the config", () => {
    renderWithProviders(<LibraryFilterSidebar {...makeProps()} />);

    for (const def of VIEW_CONFIG.tracks.facets) {
      expect(screen.getAllByText(def.labelKey).length).toBeGreaterThan(0);
    }
  });

  it("disables the clear button when there are no active filters", () => {
    renderWithProviders(<LibraryFilterSidebar {...makeProps({ hasActiveFilters: false })} />);

    expect(screen.getByRole("button", { name: "page.filters.clear" })).toBeDisabled();
  });

  it("invokes onClear when the enabled clear button is clicked", async () => {
    const onClear = vi.fn();
    const { user } = renderWithProviders(<LibraryFilterSidebar {...makeProps({ hasActiveFilters: true, onClear })} />);

    await user.click(screen.getByRole("button", { name: "page.filters.clear" }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("shows the orphan toggle for an interactive config and forwards its change", async () => {
    const onOrphanChange = vi.fn();
    const { user } = renderWithProviders(<LibraryFilterSidebar {...makeProps({ onOrphanChange })} />);

    const orphanLabel = screen.getByText("page.facets.orphanOnly");
    const orphanCheckbox = orphanLabel.closest("label")?.querySelector("[role=checkbox]");
    expect(orphanCheckbox).toBeTruthy();

    if (orphanCheckbox) await user.click(orphanCheckbox);
    expect(onOrphanChange).toHaveBeenCalledWith(true);
  });

  it("hides the orphan toggle for a non-interactive config", () => {
    renderWithProviders(<LibraryFilterSidebar {...makeProps({ config: VIEW_CONFIG.albums })} />);

    expect(screen.queryByText("page.facets.orphanOnly")).not.toBeInTheDocument();
  });

  it("forwards a facet value toggle with the facet key", async () => {
    const onToggleValue = vi.fn();
    const { user } = renderWithProviders(
      <LibraryFilterSidebar
        {...makeProps({
          onToggleValue,
          facets: { source: [{ value: "deezer", label: "Deezer", count: 4 }] },
        })}
      />
    );

    const sourceRow = screen.getByText("Deezer").closest("label");
    const checkbox = sourceRow?.querySelector("[role=checkbox]");
    expect(checkbox).toBeTruthy();
    if (checkbox) await user.click(checkbox);

    expect(onToggleValue).toHaveBeenCalledWith("source", "deezer");
  });

  it("forwards a facet search term keyed by the facet search key", async () => {
    vi.useFakeTimers();
    const onFacetSearch = vi.fn();
    try {
      renderWithProviders(
        <LibraryFilterSidebar
          {...makeProps({
            onFacetSearch,
            facets: { artist: [{ value: "daft-punk", label: "Daft Punk", count: 9 }] },
          })}
        />
      );

      const input = screen.getByLabelText("page.facets.artist");
      fireEvent.change(input, { target: { value: "daf" } });
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(onFacetSearch).toHaveBeenCalledWith("artist", "daf");
    } finally {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("reflects the orphan filter as checked when set", () => {
    renderWithProviders(<LibraryFilterSidebar {...makeProps({ filters: { orphan: ["true"] } })} />);

    const orphanLabel = screen.getByText("page.facets.orphanOnly");
    const orphanCheckbox = orphanLabel.closest("label")?.querySelector("[role=checkbox]");
    expect(orphanCheckbox).toHaveAttribute("aria-checked", "true");
  });
});
