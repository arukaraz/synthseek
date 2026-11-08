import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, within } from "@test/test-utils";

import { LibraryLetterIndex } from "../LibraryLetterIndex";

vi.mock("../../../hooks/useGridJump", () => ({
  useGridJump: () => vi.fn(),
}));

describe("LibraryLetterIndex", () => {
  it("offers every letter the server's artist index can return, from # to Z", () => {
    renderWithProviders(
      <LibraryLetterIndex
        index={{ entries: [{ letter: "B", offset: 0 }], descending: false, loadThrough: vi.fn() }}
        scrollRoot={null}
      />
    );

    const strip = screen.getByRole("navigation", { name: "Jump to a letter" });
    const letters = within(strip)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(letters.join("")).toBe("#ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  });
});
