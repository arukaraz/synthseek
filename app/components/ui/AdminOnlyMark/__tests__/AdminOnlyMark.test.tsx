import { describe, expect, it } from "vitest";

import enComponents from "@modules/i18n/messages/en/components.json";
import { renderWithProviders, screen } from "@test/test-utils";

import { AdminOnlyMark } from "../AdminOnlyMark";

describe("AdminOnlyMark", () => {
  it("exposes an accessible image named after the admin-only label", () => {
    renderWithProviders(<AdminOnlyMark />);

    const mark = screen.getByRole("img", { name: enComponents.adminOnly.label });
    expect(mark).toHaveAttribute("aria-label", enComponents.adminOnly.label);
    expect(mark).toHaveAttribute("title", enComponents.adminOnly.label);
  });

  it("keeps the decorative icon out of the accessibility tree", () => {
    const { container } = renderWithProviders(<AdminOnlyMark />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("merges a caller class onto the mark", () => {
    renderWithProviders(<AdminOnlyMark className="ml-2" />);

    expect(screen.getByRole("img", { name: enComponents.adminOnly.label })).toHaveClass("ml-2");
  });
});
