import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProviderMark } from "../ProviderMark";

describe("ProviderMark", () => {
  it("draws a distinct mark for every library source at the requested size", () => {
    const shapes = (["spotify", "plex", "navidrome", "jellyfin"] as const).map((provider) => {
      const { container, unmount } = render(<ProviderMark provider={provider} size={20} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("aria-hidden");
      const markup = svg?.innerHTML ?? "";
      unmount();
      return markup;
    });

    expect(new Set(shapes).size).toBe(4);
  });
});
