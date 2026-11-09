import { describe, expect, it } from "vitest";

import { render } from "@test/test-utils";

import { LogoIcon } from "../LogoIcon";

function paintOf(svg: SVGSVGElement) {
  const rect = svg.querySelector("rect");
  return {
    mask: svg.querySelector("mask")?.id,
    gradient: svg.querySelector("linearGradient")?.id,
    fill: rect?.getAttribute("fill"),
    maskRef: rect?.getAttribute("mask"),
  };
}

describe("LogoIcon", () => {
  it("paints each copy with its own gradient and mask, so a hidden copy cannot blank a shown one", () => {
    const { container } = render(
      <>
        <LogoIcon />
        <LogoIcon />
      </>
    );
    const [first, second] = Array.from(container.querySelectorAll("svg")).map(paintOf);

    expect(first.mask).not.toBe(second.mask);
    expect(first.gradient).not.toBe(second.gradient);
    for (const paint of [first, second]) {
      expect(paint.fill).toBe(`url(#${paint.gradient})`);
      expect(paint.maskRef).toBe(`url(#${paint.mask})`);
    }
  });
});
