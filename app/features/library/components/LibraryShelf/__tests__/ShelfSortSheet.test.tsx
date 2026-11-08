import { describe, expect, it, vi } from "vitest";

import { createLibraryController } from "@test/factories";
import { renderWithProviders, screen, within } from "@test/test-utils";
import enComponents from "@modules/i18n/messages/en/components.json";
import enLibrary from "@modules/i18n/messages/en/library.json";

import { VIEW_CONFIG } from "../../../constants";
import { ShelfSortSheet } from "../ShelfSortSheet";

const sortNames = enLibrary.page.sort;
const order = enComponents.filterSort;

describe("ShelfSortSheet", () => {
  it("lists the view's sort options, marking the current one", async () => {
    const controller = createLibraryController({ view: "albums", config: VIEW_CONFIG.albums, sort: "year" });
    renderWithProviders(<ShelfSortSheet controller={controller} open onOpenChange={vi.fn()} />);

    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByText(enLibrary.page.tabs.albums)).toBeInTheDocument();
    expect(within(sheet).queryByRole("button", { name: sortNames.duration })).not.toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: sortNames.year })).toHaveAttribute("aria-pressed", "true");
    expect(within(sheet).getByRole("button", { name: sortNames.newest })).toHaveAttribute("aria-pressed", "false");
  });

  it("applies the sort option that is picked", async () => {
    const controller = createLibraryController();
    const { user } = renderWithProviders(<ShelfSortSheet controller={controller} open onOpenChange={vi.fn()} />);

    await user.click(await screen.findByRole("button", { name: sortNames.duration }));

    expect(controller.setSort).toHaveBeenCalledWith("duration");
  });

  it("shows the effective order and applies the one that is picked", async () => {
    const controller = createLibraryController({ effectiveDirection: "desc" });
    const { user } = renderWithProviders(<ShelfSortSheet controller={controller} open onOpenChange={vi.fn()} />);

    const ascending = await screen.findByRole("button", { name: order.ascending });
    const descending = screen.getByRole("button", { name: order.descending });
    expect(descending).toHaveAttribute("aria-pressed", "true");
    expect(ascending).toHaveAttribute("aria-pressed", "false");

    await user.click(ascending);
    expect(controller.setDir).toHaveBeenLastCalledWith("asc");

    await user.click(descending);
    expect(controller.setDir).toHaveBeenLastCalledWith("desc");
  });

  it("renders nothing while closed", () => {
    renderWithProviders(<ShelfSortSheet controller={createLibraryController()} open={false} onOpenChange={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
