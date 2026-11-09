import { describe, expect, it, vi } from "vitest";

import { createLibraryController, createLibraryShell } from "@test/factories";
import { renderWithProviders, screen } from "@test/test-utils";
import enLibrary from "@modules/i18n/messages/en/library.json";

vi.mock("../../ImportLibraryMenu", () => ({
  ImportLibraryMenu: () => <span data-testid="import-menu" />,
}));
vi.mock("../ShelfViewPills", () => ({ ShelfViewPills: () => <div>view tabs</div> }));
vi.mock("../ShelfControls", () => ({ ShelfControls: () => <div>controls</div> }));
vi.mock("../ShelfActiveChips", () => ({ ShelfActiveChips: () => <div>chips</div> }));

import { LibraryShelfHeader } from "../LibraryShelfHeader";

function renderShelf(collapsed: boolean) {
  renderWithProviders(
    <LibraryShelfHeader
      controller={createLibraryController()}
      total={12}
      facets={{}}
      shell={createLibraryShell({ phone: true })}
      collapsed={collapsed}
    />
  );
  const fold = document.querySelector("[data-shelf-fold]");
  if (!(fold instanceof HTMLElement)) throw new Error("no fold");
  return fold;
}

describe("LibraryShelfHeader", () => {
  it("shows the view tabs and the controls under the title while the list is at its top", () => {
    const fold = renderShelf(false);

    expect(fold).not.toHaveAttribute("inert");
    expect(fold).toHaveClass("grid-rows-[1fr]");
    expect(fold).toHaveTextContent("view tabs");
    expect(fold).toHaveTextContent("controls");
    expect(fold).toHaveTextContent("chips");
  });

  it("folds everything under the title away while the list is scrolled, out of the tab order", () => {
    const fold = renderShelf(true);

    expect(fold).toHaveAttribute("inert");
    expect(fold).toHaveClass("grid-rows-[0fr]");
    expect(screen.getByRole("heading", { name: enLibrary.page.shelf.title })).toBeInTheDocument();
  });
});
