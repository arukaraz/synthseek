import { describe, expect, it } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { FadeScroll } from "../FadeScroll";

function overflow(node: HTMLElement, scrollTop: number) {
  Object.defineProperty(node, "scrollHeight", { configurable: true, value: 300 });
  Object.defineProperty(node, "clientHeight", { configurable: true, value: 100 });
  node.scrollTop = scrollTop;
  fireEvent.scroll(node);
}

describe("FadeScroll", () => {
  it("fades only the edges that hide more content, following the scroll", () => {
    const { container } = render(
      <FadeScroll>
        <p>rows</p>
      </FadeScroll>
    );
    const node = container.firstElementChild;
    if (!(node instanceof HTMLElement)) throw new Error("scroller missing");
    expect(node.className).not.toContain("mask-image");

    overflow(node, 0);
    expect(node.className).toContain("to_bottom,#000_calc(100%-1.5rem),transparent");

    overflow(node, 100);
    expect(node.className).toContain("to_bottom,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent");

    overflow(node, 200);
    expect(node.className).toContain("to_bottom,transparent,#000_1.5rem)");
  });

  it("becomes a named, focusable region when it carries a label", () => {
    render(
      <FadeScroll axis="x" label="All stations">
        <p>cards</p>
      </FadeScroll>
    );

    expect(screen.getByRole("region", { name: "All stations" })).toHaveAttribute("tabindex", "0");
  });

  it("lets a vertical list hand the wheel on to the page once it reaches its end", () => {
    const { container } = render(
      <FadeScroll>
        <p>rows</p>
      </FadeScroll>
    );

    expect(container.firstElementChild?.className).not.toContain("overscroll-y-contain");
  });

  it("offers arrows along a horizontal rail when asked, showing each one only while it has somewhere to go", () => {
    render(
      <FadeScroll axis="x" arrows>
        <p>cards</p>
      </FadeScroll>
    );
    const left = screen.getByRole("button", { name: "Scroll left" });
    const right = screen.getByRole("button", { name: "Scroll right" });

    expect(left.parentElement).toHaveClass("invisible");
    expect(right.parentElement).toHaveClass("invisible");
  });

  it("renders no arrows unless asked", () => {
    render(
      <FadeScroll axis="x">
        <p>cards</p>
      </FadeScroll>
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
