import { describe, expect, it, vi } from "vitest";

import { createLibraryController } from "@test/factories";
import { renderWithProviders, screen } from "@test/test-utils";
import enCommon from "@modules/i18n/messages/en/common.json";
import enLibrary from "@modules/i18n/messages/en/library.json";

vi.mock("../../ImportLibraryMenu", () => ({
  ImportLibraryMenu: () => <span data-testid="import-menu" />,
}));

import { VIEW_CONFIG } from "../../../constants";
import { ShelfTitleBar } from "../ShelfTitleBar";

const page = enLibrary.page;

describe("ShelfTitleBar", () => {
  it("counts the whole view when nothing narrows it", () => {
    renderWithProviders(<ShelfTitleBar controller={createLibraryController()} total={12} />);

    expect(screen.getByRole("heading", { name: page.shelf.title })).toBeInTheDocument();
    expect(screen.getByText("12 tracks")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("speaks of matches once a filter narrows the view", () => {
    const controller = createLibraryController({
      view: "albums",
      config: VIEW_CONFIG.albums,
      filters: { genre: ["rock"] },
    });
    renderWithProviders(<ShelfTitleBar controller={controller} total={1} />);

    expect(screen.getByText("1 album matches")).toBeInTheDocument();
  });

  it("keeps the search field open and speaks of matches while a search is applied", () => {
    renderWithProviders(<ShelfTitleBar controller={createLibraryController({ search: "abba" })} total={4} />);

    expect(screen.getByText("4 tracks match")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("abba");
    expect(screen.getByRole("button", { name: page.toolbar.searchAria })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens a focused search field from the search button", async () => {
    const { user } = renderWithProviders(<ShelfTitleBar controller={createLibraryController()} total={3} />);

    const toggle = screen.getByRole("button", { name: page.toolbar.searchAria });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    const field = screen.getByRole("textbox");
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute("placeholder", page.toolbar.searchTracks);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("closes the field and clears the search on Cancel", async () => {
    const controller = createLibraryController({ search: "abba" });
    const { user } = renderWithProviders(<ShelfTitleBar controller={controller} total={4} />);

    await user.click(screen.getByRole("button", { name: enCommon.cancel }));

    expect(controller.setSearch).toHaveBeenCalledWith("");
  });

  it("closes the field from the search button when it is open with nothing typed", async () => {
    const controller = createLibraryController();
    const { user } = renderWithProviders(<ShelfTitleBar controller={controller} total={3} />);
    const toggle = screen.getByRole("button", { name: page.toolbar.searchAria });

    await user.click(toggle);
    await user.click(toggle);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(controller.setSearch).toHaveBeenCalledWith("");
  });

  it("empties the field and the search from the clear button, keeping focus in the field", async () => {
    const controller = createLibraryController();
    const { user } = renderWithProviders(<ShelfTitleBar controller={controller} total={3} />);

    await user.click(screen.getByRole("button", { name: page.toolbar.searchAria }));
    expect(screen.queryByRole("button", { name: page.shelf.clearSearch })).not.toBeInTheDocument();
    await user.type(screen.getByRole("textbox"), "queen");

    await user.click(screen.getByRole("button", { name: page.shelf.clearSearch }));

    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByRole("textbox")).toHaveFocus();
    expect(controller.setSearch).toHaveBeenCalledWith("");
  });
});
