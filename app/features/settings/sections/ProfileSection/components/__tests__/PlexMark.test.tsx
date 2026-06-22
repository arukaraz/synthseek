import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

import { PlexMark } from "../PlexMark";

afterEach(() => {
  cleanup();
});

describe("PlexMark", () => {
  it("renders an svg at the default size", () => {
    const { container } = render(<PlexMark />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "18");
    expect(svg).toHaveAttribute("height", "18");
    expect(svg).toHaveAttribute("aria-hidden");
  });

  it("renders at a custom size", () => {
    const { container } = render(<PlexMark size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });
});
