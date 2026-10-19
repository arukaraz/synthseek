import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { BoardToolbar } from "../BoardToolbar";

function renderInScroller(editing: boolean) {
  render(
    <div data-testid="scroller">
      <div data-testid="inner-list" />
      <BoardToolbar editing={editing} onCustomize={vi.fn()} onDone={vi.fn()} onAddWidget={vi.fn()} />
    </div>
  );
  const scroller = screen.getByTestId("scroller");
  const scrollTo = (element: HTMLElement, top: number) => {
    element.scrollTop = top;
    fireEvent.scroll(element);
  };
  return { scroller, inner: screen.getByTestId("inner-list"), scrollTo };
}

describe("BoardToolbar", () => {
  it("gets the Customize button out of the way while the reader scrolls down", () => {
    const { scroller, scrollTo } = renderInScroller(false);
    const fab = screen.getByRole("button", { name: "Customize" });

    expect(fab).not.toHaveClass("opacity-0");
    scrollTo(scroller, 200);

    expect(fab).toHaveClass("opacity-0");
  });

  it("brings the Customize button back as soon as the reader scrolls up", () => {
    const { scroller, scrollTo } = renderInScroller(false);
    scrollTo(scroller, 200);

    scrollTo(scroller, 150);

    expect(screen.getByRole("button", { name: "Customize" })).not.toHaveClass("opacity-0");
  });

  it("ignores a list scrolling inside a widget", () => {
    const { inner, scrollTo } = renderInScroller(false);

    scrollTo(inner, 200);

    expect(screen.getByRole("button", { name: "Customize" })).not.toHaveClass("opacity-0");
  });

  it("keeps the edit controls in place whatever the scroll", () => {
    const { scroller, scrollTo } = renderInScroller(true);

    scrollTo(scroller, 200);

    expect(screen.getByRole("button", { name: "Done" })).toBeVisible();
    expect(screen.getByRole("toolbar")).not.toHaveClass("opacity-0");
  });
});
