import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SegmentTabs } from "../SegmentTabs";

const ITEMS = [
  { value: "discord", label: "Discord" },
  { value: "ntfy", label: "ntfy" },
  { value: "apprise", label: "Apprise", count: 3 },
];

describe("SegmentTabs", () => {
  it("marks the active tab and reports the one chosen", async () => {
    const onValueChange = vi.fn();
    render(
      <SegmentTabs items={ITEMS} value="ntfy" onValueChange={onValueChange} layoutId="test-tabs" ariaLabel="Channels" />
    );

    expect(screen.getByRole("tab", { name: "ntfy" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(screen.getByRole("tab", { name: /Apprise/ }));

    expect(onValueChange).toHaveBeenCalledWith("apprise");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("scrolls a row too wide for its container instead of overflowing it", () => {
    render(
      <SegmentTabs items={ITEMS} value="discord" onValueChange={vi.fn()} layoutId="test-tabs" ariaLabel="Channels" />
    );

    expect(screen.getByRole("tablist", { name: "Channels" })).toHaveClass("overflow-x-auto", "scrollbar-none");
    for (const tab of screen.getAllByRole("tab")) expect(tab).toHaveClass("shrink-0", "whitespace-nowrap");
  });
});
