import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

import { LoadingRing } from "@components/ui/LoadingRing";
import { LOADING_RING_STROKE_WIDTH } from "@components/ui/LoadingRing/constants";

afterEach(cleanup);

function ring(container: HTMLElement): SVGSVGElement {
  const found = container.querySelector("svg");
  if (found === null) throw new Error("the ring did not render");
  return found;
}

describe("LoadingRing", () => {
  it("spins by default, so a caller gets the loading behaviour without asking for it", () => {
    const { container } = render(<LoadingRing />);

    expect(ring(container).getAttribute("class")).toContain("animate-loading-ring");
  });

  it("holds still when the caller says it is not spinning, for a state that is active but waiting", () => {
    const { container } = render(<LoadingRing spinning={false} />);

    expect(ring(container).getAttribute("class")).not.toContain("animate-loading-ring");
  });

  it("draws with the current colour so it takes the tone of whatever it surrounds", () => {
    const { container } = render(<LoadingRing />);

    expect(container.querySelector("circle")?.getAttribute("stroke")).toBe("currentColor");
  });

  it("takes a heavier stroke when asked, and keeps its own default otherwise", () => {
    const { container: thick } = render(<LoadingRing strokeWidth={12} />);
    expect(thick.querySelector("circle")?.getAttribute("stroke-width")).toBe("12");

    cleanup();
    const { container: normal } = render(<LoadingRing />);
    expect(normal.querySelector("circle")?.getAttribute("stroke-width")).toBe(String(LOADING_RING_STROKE_WIDTH));
  });

  it("stays out of the way of clicks, since it sits on top of what it decorates", () => {
    const { container } = render(<LoadingRing />);

    expect(ring(container).getAttribute("class")).toContain("pointer-events-none");
    expect(ring(container).getAttribute("aria-hidden")).toBe("true");
  });
});
