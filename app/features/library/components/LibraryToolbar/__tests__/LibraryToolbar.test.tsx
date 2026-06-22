import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderWithProviders, screen, act, fireEvent } from "@test/test-utils";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../LibraryFilterSortMenu", () => ({
  LibraryFilterSortMenu: () => <div data-testid="filter-sort-menu" />,
}));

import { LibraryToolbar } from "../LibraryToolbar";
import type { LibraryToolbarProps } from "../types";

function makeProps(overrides?: Partial<LibraryToolbarProps>): LibraryToolbarProps {
  return {
    controller: {} as unknown as LibraryToolbarProps["controller"],
    searchValue: "",
    searchPlaceholderKey: "page.toolbar.searchTracks",
    onSearchChange: vi.fn(),
    onViewChange: vi.fn(),
    onOpenFilters: vi.fn(),
    activeFilterCount: 0,
    ...overrides,
  };
}

describe("LibraryToolbar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("debounces the search input before calling onSearchChange", () => {
    const onSearchChange = vi.fn();
    renderWithProviders(<LibraryToolbar {...makeProps({ onSearchChange })} />);

    const input = screen.getByLabelText("page.toolbar.searchAria");
    fireEvent.change(input, { target: { value: "rock" } });

    expect(input).toHaveValue("rock");
    expect(onSearchChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearchChange).toHaveBeenCalledWith("rock");
  });

  it("opens the filter sheet when the mobile filter button is clicked", () => {
    const onOpenFilters = vi.fn();
    renderWithProviders(<LibraryToolbar {...makeProps({ onOpenFilters })} />);

    act(() => {
      screen.getByRole("button", { name: "page.toolbar.openFilters" }).click();
    });

    expect(onOpenFilters).toHaveBeenCalledTimes(1);
  });

  it("shows the active filter count badge when filters are applied", () => {
    renderWithProviders(<LibraryToolbar {...makeProps({ activeFilterCount: 3 })} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("hides the filter count badge when no filters are applied", () => {
    renderWithProviders(<LibraryToolbar {...makeProps({ activeFilterCount: 0 })} />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
