import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { CHANNEL_GLYPHS } from "../constants";
import { ChannelMark } from "../components/ChannelMark";
import type { NotificationChannel } from "../types";

function mark(channel: NotificationChannel, size: "sm" | "md") {
  const { container } = render(<ChannelMark channel={channel} size={size} />);
  const root = container.firstElementChild;
  expect(root).not.toBeNull();
  return root ?? container;
}

describe("ChannelMark", () => {
  it.each(["discord", "ntfy"] as const)("draws the brand path of %s", (channel) => {
    const glyph = CHANNEL_GLYPHS[channel];
    const root = mark(channel, "md");
    const path = root.querySelector("svg > path");
    expect(path).not.toBeNull();
    expect(glyph.kind === "path" ? glyph.d : null).toBe(path?.getAttribute("d"));
    expect(path).toHaveAttribute("fill-rule", "evenodd");
  });

  it.each([
    ["telegram", "lucide-send"],
    ["webhook", "lucide-webhook"],
    ["apprise", "lucide-megaphone"],
  ] as const)("draws the icon of %s", (channel, iconClass) => {
    const root = mark(channel, "md");
    expect(root.querySelector("svg")).toHaveClass(iconClass);
  });

  it("is hidden from assistive technology, since the channel is named next to it", () => {
    expect(mark("discord", "sm")).toHaveAttribute("aria-hidden", "true");
  });

  it("sizes the mark and its glyph together", () => {
    const small = mark("telegram", "sm");
    expect(small).toHaveClass("size-6");
    expect(small.querySelector("svg")).toHaveClass("size-3.5");
    const medium = mark("discord", "md");
    expect(medium).toHaveClass("size-9");
    expect(medium).not.toHaveClass("size-6");
  });
});
