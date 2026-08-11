import { fireEvent, render, screen } from "@testing-library/react";
import { ListPlus, RefreshCcw } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { BulkActionBar } from "../BulkActionBar";
import type { BulkActionBarProps } from "../types";

function renderBar(overrides: Partial<BulkActionBarProps> = {}) {
  const onRetry = vi.fn();
  const onAdd = vi.fn();
  const onClear = vi.fn();
  const props: BulkActionBarProps = {
    count: 4,
    countLabel: "selected",
    clearLabel: "Clear",
    onClear,
    actions: [
      { icon: RefreshCcw, label: "Retry 2 failed", onClick: onRetry, count: 2 },
      { icon: ListPlus, label: "Add to playlist", onClick: onAdd },
    ],
    ...overrides,
  };
  return { props, onRetry, onAdd, onClear, ...render(<BulkActionBar {...props} />) };
}

describe("BulkActionBar", () => {
  it("wraps onto a second row instead of pushing the clear button past the bar", () => {
    const { container } = renderBar();
    const bar = container.firstElementChild;
    expect(bar?.className).toContain("flex-wrap");
    expect(bar?.className).not.toContain("flex-nowrap");
  });

  it("preserves the full accessible name on every action button", () => {
    renderBar();
    expect(screen.getByRole("button", { name: "Retry 2 failed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to playlist" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
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

  it("keeps an action count visible on mobile while hiding it on desktop", () => {
    renderBar();
    const count = screen.getByText("2", { selector: "span" });
    expect(count.className).toContain("sm:hidden");
    expect(count).toHaveAttribute("aria-hidden", "true");
  });

  it("renders only the provided actions", () => {
    renderBar({ actions: [{ icon: ListPlus, label: "Add to playlist", onClick: vi.fn() }] });
    expect(screen.queryByText(/retry/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to playlist" })).toBeInTheDocument();
  });

  it("fires each action callback and the clear callback", () => {
    const { onRetry, onAdd, onClear } = renderBar();
    fireEvent.click(screen.getByRole("button", { name: "Retry 2 failed" }));
    fireEvent.click(screen.getByRole("button", { name: "Add to playlist" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("disables an action when its descriptor is disabled", () => {
    renderBar({
      actions: [{ icon: RefreshCcw, label: "Retry 2 failed", onClick: vi.fn(), count: 2, disabled: true }],
    });
    expect(screen.getByRole("button", { name: "Retry 2 failed" })).toBeDisabled();
  });
});
