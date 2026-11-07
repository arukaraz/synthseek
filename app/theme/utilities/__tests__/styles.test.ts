import { describe, expect, it } from "vitest";

import { primaryGradientButton } from "../styles";

describe("primaryGradientButton", () => {
  it("writes its label in the light overlay colour on every theme, not the page text or a theme's dark primary foreground", () => {
    const classes = primaryGradientButton().split(" ");

    expect(classes).toContain("text-overlay-fg");
    expect(classes).not.toContain("text-fg");
    expect(classes).not.toContain("text-primary-foreground");
  });
});
