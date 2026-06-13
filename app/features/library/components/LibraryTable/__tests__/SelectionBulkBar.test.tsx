import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import enLibrary from "@modules/i18n/messages/en/library.json";

import { SelectionBulkBar } from "../SelectionBulkBar";
import type { SelectionBulkBarProps } from "../types";

function renderBar(overrides: Partial<SelectionBulkBarProps> = {}) {
  const props: SelectionBulkBarProps = {
    selectedCount: 4,
    failedCount: 2,
    onRetryFailed: vi.fn(),
    onAddToPlaylist: vi.fn(),
    onClear: vi.fn(),
    isRetrying: false,
    ...overrides,
  };
  return { props, ...render(<SelectionBulkBar {...props} />) };
}

describe("SelectionBulkBar", () => {
  it("keeps the bar on a single non-wrapping row", () => {
    const { container } = renderBar();
    const bar = container.firstElementChild;
    expect(bar?.className).toContain("flex-nowrap");
    expect(bar?.className).not.toContain("flex-wrap");
  });

  it("preserves the full accessible name on every action button", () => {
    renderBar({ selectedCount: 4, failedCount: 3 });
    expect(
      screen.getByRole("button", {
        name: enLibrary.page.selection.retryFailed_other.replace("{{count}}", "3"),
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enLibrary.page.selection.addToPlaylist })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enLibrary.page.selection.clear })).toBeInTheDocument();
  });

  it("collapses the action words to icon-only below the sm breakpoint", () => {
    renderBar();
    const labels = screen.getAllByText(
      (_, node) => node?.className === "hidden sm:inline" && node.getAttribute("aria-hidden") === "true"
    );
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.className).toContain("hidden");
      expect(label.className).toContain("sm:inline");
    }
  });

  it("keeps the failed count visible on mobile while hiding it on desktop", () => {
    renderBar({ failedCount: 5 });
    const count = screen.getByText("5", { selector: "span" });
    expect(count.className).toContain("sm:hidden");
    expect(count).toHaveAttribute("aria-hidden", "true");
  });

  it("omits the retry button when no failed tracks are selected", () => {
    renderBar({ failedCount: 0 });
    expect(screen.queryByText(/retry/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: enLibrary.page.selection.addToPlaylist })).toBeInTheDocument();
  });

  it("fires the retry, add-to-playlist and clear callbacks", () => {
    const { props } = renderBar({ selectedCount: 4, failedCount: 2 });
    fireEvent.click(
      screen.getByRole("button", {
        name: enLibrary.page.selection.retryFailed_other.replace("{{count}}", "2"),
      })
    );
    fireEvent.click(screen.getByRole("button", { name: enLibrary.page.selection.addToPlaylist }));
    fireEvent.click(screen.getByRole("button", { name: enLibrary.page.selection.clear }));
    expect(props.onRetryFailed).toHaveBeenCalledTimes(1);
    expect(props.onAddToPlaylist).toHaveBeenCalledTimes(1);
    expect(props.onClear).toHaveBeenCalledTimes(1);
  });

  it("disables the retry button while a retry is in flight", () => {
    renderBar({ failedCount: 2, isRetrying: true });
    expect(
      screen.getByRole("button", {
        name: enLibrary.page.selection.retryFailed_other.replace("{{count}}", "2"),
      })
    ).toBeDisabled();
  });
});
