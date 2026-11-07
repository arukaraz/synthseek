import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { BoardToolbar } from "../BoardToolbar";
import type { BoardToolbarProps } from "../types";

function handlers(): Omit<BoardToolbarProps, "editing"> {
  return {
    onCustomize: vi.fn(),
    onDone: vi.fn(),
    onAddSpacer: vi.fn(),
    onCustomization: vi.fn(),
  };
}

function renderInScroller(editing: boolean) {
  render(
    <div data-testid="scroller">
      <div data-testid="inner-list" />
      <BoardToolbar editing={editing} {...handlers()} />
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

  it("renders on the page body, so a blurred ancestor cannot pull it off the bottom of the screen", () => {
    render(
      <main style={{ backdropFilter: "blur(4px)" }}>
        <BoardToolbar editing {...handlers()} />
      </main>
    );

    expect(screen.getByRole("toolbar").parentElement?.parentElement).toBe(document.body);
  });

  it("opens edit mode from the Customize button", () => {
    const actions = handlers();
    render(<BoardToolbar editing={false} {...actions} />);

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));

    expect(actions.onCustomize).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["Board Customization", "onCustomization"],
    ["Done", "onDone"],
  ] as const)("runs %s from the edit menu", (name, handler) => {
    const actions = handlers();
    render(<BoardToolbar editing {...actions} />);

    fireEvent.click(screen.getByRole("button", { name }));

    expect(actions[handler]).toHaveBeenCalledTimes(1);
  });

  it("leads the menu with Add, then Board Customization, and keeps Done outside the part that scrolls", () => {
    render(<BoardToolbar editing {...handlers()} />);
    const add = screen.getByRole("button", { name: "Add" });
    const scroller = add.parentElement?.parentElement;

    expect(scroller).toHaveClass("overflow-x-auto");
    expect(Array.from(add.parentElement?.children ?? [], (button) => button.textContent)).toEqual([
      "Add",
      "Board Customization",
    ]);
    expect(scroller).not.toContainElement(screen.getByRole("button", { name: "Done" }));
  });

  it("draws the pencil as part of the grid, with no badge of its own", () => {
    render(<BoardToolbar editing={false} {...handlers()} />);
    const icon = screen.getByRole("button", { name: "Customize" }).querySelector("svg");

    expect(icon?.querySelectorAll("rect")).toHaveLength(3);
    expect(icon?.querySelector(".lucide-pencil")?.parentElement).toBe(icon);
  });

  it("names Done for assistive tech but draws only its check mark", () => {
    render(<BoardToolbar editing {...handlers()} />);

    expect(screen.getByRole("button", { name: "Done" })).toHaveTextContent(/^$/);
  });

  it("adds a spacer from the Add menu", async () => {
    const actions = handlers();
    render(<BoardToolbar editing {...actions} />);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Add" }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Spacer" }));

    expect(actions.onAddSpacer).toHaveBeenCalledTimes(1);
  });

  it("keeps the edit controls in place whatever the scroll", () => {
    const { scroller, scrollTo } = renderInScroller(true);
    scrollTo(scroller, 200);

    expect(screen.getByRole("button", { name: "Done" })).toBeVisible();
    expect(screen.getByRole("toolbar")).not.toHaveClass("opacity-0");
  });
});
