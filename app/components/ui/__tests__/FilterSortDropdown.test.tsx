import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterSortDropdown } from "../FilterSortDropdown";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "rock", label: "Rock" },
];

function renderMenu(onFilter = vi.fn()) {
  render(
    <FilterSortDropdown
      filter={{ value: "all", onChange: onFilter, options: OPTIONS, sectionLabel: "Category" }}
      filterGroups={[
        {
          id: "state",
          label: "State",
          value: "any",
          onChange: vi.fn(),
          options: [{ value: "any", label: "Any" }],
        },
      ]}
    />
  );
}

describe("FilterSortDropdown columns", () => {
  it("draws the filter as the first column beside the filter groups", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));

    const menu = within(await screen.findByRole("menu"));
    const category = menu.getByRole("group", { name: "Category" });
    const state = menu.getByRole("group", { name: "State" });
    expect(category.compareDocumentPosition(state) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("hands back the option picked in that column", async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    renderMenu(onFilter);

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));
    await user.click(await screen.findByRole("menuitemradio", { name: "Rock" }));

    expect(onFilter).toHaveBeenCalledWith("rock");
  });
});
