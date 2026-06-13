import { describe, expect, it } from "vitest";

import { bottomNavContainer } from "../styles";

describe("bottomNavContainer", () => {
  it("sits below the dialog z-50 tier so modals always cover it", () => {
    const result = bottomNavContainer();
    expect(result).toContain("z-30");
    expect(result).not.toContain("z-40");
    expect(result).not.toContain("z-50");
  });
});
