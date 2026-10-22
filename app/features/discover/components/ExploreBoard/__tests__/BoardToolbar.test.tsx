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
  return { scroller, scrollTo };
}

describe("BoardToolbar", () => {
  it("keeps the Customize button in place while the reader scrolls down", () => {
    const { scroller, scrollTo } = renderInScroller(false);
    const fab = screen.getByRole("button", { name: "Customize" });

    scrollTo(scroller, 200);

    expect(fab).toBeVisible();
    expect(fab).not.toHaveClass("opacity-0");
    expect(fab).toHaveClass("pointer-events-auto");
  });

  it("opens edit mode from the Customize button", () => {
    const onCustomize = vi.fn();
    render(<BoardToolbar editing={false} onCustomize={onCustomize} onDone={vi.fn()} onAddWidget={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));

    expect(onCustomize).toHaveBeenCalledTimes(1);
  });

  it("keeps the edit controls in place whatever the scroll", () => {
    const { scroller, scrollTo } = renderInScroller(true);
    scrollTo(scroller, 200);

    expect(screen.getByRole("button", { name: "Done" })).toBeVisible();
    expect(screen.getByRole("toolbar")).not.toHaveClass("opacity-0");
  });
});
