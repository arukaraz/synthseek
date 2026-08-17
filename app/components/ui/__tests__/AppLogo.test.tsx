import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { AppLogo } from "../AppLogo";
import { LogoIcon } from "../LogoIcon";

describe("AppLogo", () => {
  it("keeps the two className slots independent", () => {
    const { container } = render(
      <AppLogo iconClassName="h-12 w-auto sm:h-14" wordmarkClassName="hidden sm:block sm:text-3xl" />
    );

    const mark = container.querySelector("svg");
    const wordmark = container.querySelector("span");

    expect(mark?.getAttribute("class")).toContain("sm:h-14");
    expect(wordmark?.getAttribute("class")).toContain("sm:text-3xl");
    expect(wordmark?.getAttribute("class")).toContain("hidden");
  });

  it("carries a base size on each slot so an unsized caller still renders", () => {
    const { container } = render(<AppLogo />);

    expect(container.querySelector("svg")?.getAttribute("class")).toContain("h-12");
    expect(container.querySelector("span")?.getAttribute("class")).toContain("text-2xl");
  });

  it("lets a caller override the mark size at a single breakpoint", () => {
    const { container } = render(<LogoIcon className="h-6" />);
    const cls = container.querySelector("svg")?.getAttribute("class") ?? "";

    expect(cls).toContain("h-6");
    expect(cls).not.toContain("h-12");
    expect(cls).not.toContain("sm:h-14");
  });
});
