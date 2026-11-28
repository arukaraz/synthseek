import { describe, expect, it } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { InfoTooltip } from "../InfoTooltip/InfoTooltip";

describe("InfoTooltip", () => {
  it.each(["hover", "click"] as const)("rings the %s trigger when it is reached with the keyboard", (trigger) => {
    renderWithProviders(<InfoTooltip description="More about this" trigger={trigger} />);

    const button = screen.getByRole("button", { name: "More information" });

    expect(button).toHaveClass("focus-visible:ring-2", "focus-visible:ring-primary-400");
    expect(button.className).not.toMatch(/(^|\s)ring-2/);
  });
});
