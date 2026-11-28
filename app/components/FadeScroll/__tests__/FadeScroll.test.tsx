import { describe, expect, it } from "vitest";

import { fireEvent, render, screen, waitFor } from "@test/test-utils";

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

  it("can be reached and scrolled by keyboard when it hides rows and holds nothing to focus", () => {
    const { container } = render(
      <FadeScroll>
        <p>rows</p>
      </FadeScroll>
    );
    const node = container.firstElementChild;
    if (!(node instanceof HTMLElement)) throw new Error("scroller missing");
    expect(node).not.toHaveAttribute("tabindex");

    overflow(node, 0);

    expect(screen.getByRole("group", { name: "Scrollable list" })).toBe(node);
    expect(node).toHaveAttribute("tabindex", "0");
  });

  it("draws its focus outline inside its own box, where the frame around it cannot clip it", () => {
    const { container } = render(
      <FadeScroll>
        <p>rows</p>
      </FadeScroll>
    );

    expect(container.firstElementChild).toHaveClass("focus-visible:-outline-offset-2");
  });

  it("adds no stop of its own when a row inside it can already take focus", () => {
    const { container } = render(
      <FadeScroll>
        <button type="button">Play</button>
      </FadeScroll>
    );
    const node = container.firstElementChild;
    if (!(node instanceof HTMLElement)) throw new Error("scroller missing");

    overflow(node, 0);

    expect(node).not.toHaveAttribute("tabindex");
    expect(node).not.toHaveAttribute("role");
  });

  it("gives its stop back once a row that can take focus arrives", async () => {
    const { container, rerender } = render(
      <FadeScroll>
        <p>rows</p>
      </FadeScroll>
    );
    const node = container.firstElementChild;
    if (!(node instanceof HTMLElement)) throw new Error("scroller missing");
    overflow(node, 0);
    expect(node).toHaveAttribute("tabindex", "0");

    rerender(
      <FadeScroll>
        <p>rows</p>
        <button type="button">Play</button>
      </FadeScroll>
    );

    await waitFor(() => expect(node).not.toHaveAttribute("tabindex"));
  });

  it("keeps the name it was given when it also hides rows", () => {
    render(
      <FadeScroll label="All stations">
        <p>cards</p>
      </FadeScroll>
    );
    const node = screen.getByRole("region", { name: "All stations" });

    overflow(node, 0);

    expect(screen.getByRole("region", { name: "All stations" })).toHaveAttribute("tabindex", "0");
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
