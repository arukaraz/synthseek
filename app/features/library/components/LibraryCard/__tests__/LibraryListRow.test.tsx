import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { LibraryListRow } from "../LibraryListRow";
import type { CardSelection } from "../types";

function selection(overrides: Partial<CardSelection> = {}): CardSelection {
  return {
    selected: false,
    selecting: true,
    preview: "none",
    onToggle: vi.fn(),
    onHover: vi.fn(),
    ...overrides,
  };
}

const BASE = {
  title: "Discovery",
  subtitle: "Daft Punk",
  openLabel: "Open Discovery",
  selectLabel: "Select Discovery",
  artwork: <span data-testid="art" />,
  trailing: <span data-testid="trailing" />,
};

describe("LibraryListRow", () => {
  it("opens from a click or an activation key and shows its trailing action", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<LibraryListRow {...BASE} onOpen={onOpen} />);
    const row = screen.getByRole("button", { name: "Open Discovery" });

    await user.click(row);
    row.focus();
    await user.keyboard("{Enter}");

    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(row).not.toHaveAttribute("aria-pressed");
    expect(screen.getByTestId("trailing")).toBeInTheDocument();
  });

  it("is plain text with nothing to open and no selection under way", () => {
    renderWithProviders(<LibraryListRow {...BASE} selection={selection({ selecting: false })} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
  });

  it("toggles its selection instead of opening while selecting, hiding the trailing action", async () => {
    const onOpen = vi.fn();
    const select = selection({ selected: true });
    const { user } = renderWithProviders(<LibraryListRow {...BASE} onOpen={onOpen} selection={select} />);
    const row = screen.getByRole("button", { name: "Select Discovery" });

    await user.click(row);

    expect(row).toHaveAttribute("aria-pressed", "true");
    expect(select.onToggle).toHaveBeenCalledWith(false);
    expect(onOpen).not.toHaveBeenCalled();
    expect(screen.queryByTestId("trailing")).not.toBeInTheDocument();
  });

  it("can be selected even without anything to open", async () => {
    const select = selection();
    const { user } = renderWithProviders(<LibraryListRow {...BASE} selection={select} />);
    const row = screen.getByRole("button", { name: "Select Discovery" });

    await user.click(row);

    expect(row).toHaveAttribute("aria-pressed", "false");
    expect(select.onToggle).toHaveBeenCalledTimes(1);
  });
});
