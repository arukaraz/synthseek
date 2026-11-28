import { describe, expect, it } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { CardStatusDot } from "../CardStatusDot";
import { statusDotTone } from "../helpers";

describe("CardStatusDot", () => {
  it("names the status for a screen reader and for the pointer, in the status's own words", () => {
    renderWithProviders(<CardStatusDot status="complete" />);

    const dot = screen.getByRole("img");
    expect(dot).toHaveAttribute("aria-label");
    expect(dot).toHaveAttribute("title", dot.getAttribute("aria-label"));
  });

  it("carries the status's own icon, drawn only inside the mode", () => {
    const { container } = renderWithProviders(<CardStatusDot status="failed" />);

    const icon = container.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.getAttribute("class")).toContain("hidden");
    expect(icon?.getAttribute("class")).toContain("a11y-mode:block");
  });

  it("marks the dot with its tone so a forced-colours rule can tell the states apart", () => {
    const { container } = renderWithProviders(<CardStatusDot status="failed" />);

    expect(container.querySelector("[data-status-dot]")).toHaveAttribute("data-status-dot", "failed");
  });
});

describe("statusDotTone", () => {
  it.each([
    ["complete", "complete"],
    ["partially_complete", "complete"],
    ["failed", "failed"],
    ["cancelled", "failed"],
    ["downloading", "active"],
    ["queued", "active"],
    ["delegated", "idle"],
  ] as const)("reads %s as %s", (status, tone) => {
    expect(statusDotTone(status)).toBe(tone);
  });
});
