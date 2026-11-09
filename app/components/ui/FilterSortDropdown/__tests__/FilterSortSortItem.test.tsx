import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import enComponents from "@modules/i18n/messages/en/components.json";
import { renderWithProviders, screen, within } from "@test/test-utils";

import { FilterSortSortItem } from "../FilterSortSortItem";
import type { FilterSortSortOption } from "../types";

async function openWith(option: FilterSortSortOption<string>) {
  const view = renderWithProviders(
    <DropdownMenu>
      <DropdownMenuTrigger>open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value="">
          <FilterSortSortItem option={option} />
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  await view.user.click(screen.getByRole("button", { name: "open" }));
  return within(await screen.findByRole("menu"));
}

describe("FilterSortSortItem", () => {
  it("shows the admin-only mark when the option is admin only", async () => {
    const menu = await openWith({ value: "allPlays", label: "Most played", adminOnly: true });

    const item = menu.getByRole("menuitemradio", { name: /Most played/ });
    expect(within(item).getByRole("img", { name: enComponents.adminOnly.label })).toBeInTheDocument();
  });

  it("shows no mark for an option everyone can use", async () => {
    const menu = await openWith({ value: "recent", label: "Newest" });

    expect(menu.getByRole("menuitemradio", { name: "Newest" })).toBeInTheDocument();
    expect(menu.queryByRole("img", { name: enComponents.adminOnly.label })).not.toBeInTheDocument();
  });

  it("shows no mark when adminOnly is explicitly false", async () => {
    const menu = await openWith({ value: "recent", label: "Newest", adminOnly: false });

    expect(menu.queryByRole("img", { name: enComponents.adminOnly.label })).not.toBeInTheDocument();
  });
});
