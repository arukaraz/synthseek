import { describe, expect, it } from "vitest";

import { buttonVariants } from "../styles";

describe("buttonVariants focus ring", () => {
  it("gives the outline variant the primary ring and no competing neutral ring", () => {
    const result = buttonVariants({ variant: "outline" });
    expect(result).toContain("focus-visible:ring-primary");
    expect(result).not.toContain("focus-visible:ring-ring");
    expect(result).not.toContain("focus-visible:ring-primary/60");
  });

  it("keeps the neutral ring on every other variant", () => {
    for (const variant of ["default", "destructive", "secondary", "accent", "ghost", "link"] as const) {
      expect(buttonVariants({ variant })).toContain("focus-visible:ring-ring");
    }
  });
});
