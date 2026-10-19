import { describe, expect, it } from "vitest";

import { primaryGradientButton } from "../styles";

describe("primaryGradientButton", () => {
  it("writes its label in the colour made for text on the primary hue, not the page text colour", () => {
    const classes = primaryGradientButton().split(" ");

    expect(classes).toContain("text-primary-foreground");
    expect(classes).not.toContain("text-fg");
  });
});
