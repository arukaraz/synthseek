import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

vi.mock("@hooks/api/queries/board/useBoardAppearance", () => ({
  useBoardAppearance: () => ({ data: { density: "comfortable", text: "default" } }),
}));
vi.mock("@hooks/api/mutations/board/useSetBoardAppearance", () => ({ useSetBoardAppearance: () => vi.fn() }));

import { BoardToolbar } from "../BoardToolbar";
import type { BoardToolbarProps } from "../types";

function handlers(): Omit<BoardToolbarProps, "editing"> {
  return {
    onCustomize: vi.fn(),
    onDone: vi.fn(),
    onManageWidgets: vi.fn(),
    onAddSpacer: vi.fn(),
    onArrange: vi.fn(),
    onTemplates: vi.fn(),
    background: "on",
    onBackground: vi.fn(),
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

function appearanceButton(): HTMLElement {
  return screen.getByRole("button", { name: "Appearance" });
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
    ["Manage widgets", "onManageWidgets"],
    ["Arrange", "onArrange"],
    ["Templates", "onTemplates"],
    ["Done", "onDone"],
  ] as const)("runs %s from the edit menu", (name, handler) => {
    const actions = handlers();
    render(<BoardToolbar editing {...actions} />);

    fireEvent.click(screen.getByRole("button", { name }));

    expect(actions[handler]).toHaveBeenCalledTimes(1);
  });

  it("leads the menu with Add, then Manage widgets, and keeps Done outside the part that scrolls", () => {
    render(<BoardToolbar editing {...handlers()} />);
    const add = screen.getByRole("button", { name: "Add" });
    const scroller = add.parentElement?.parentElement;

    expect(scroller).toHaveClass("overflow-x-auto");
    expect(Array.from(add.parentElement?.children ?? [], (button) => button.textContent)).toEqual([
      "Add",
      "Manage widgets",
      "Arrange",
      "Appearance",
      "Templates",
    ]);
    expect(scroller).not.toContainElement(screen.getByRole("button", { name: "Done" }));
  });

  it("draws the pencil as part of the grid, with no badge of its own", () => {
    render(<BoardToolbar editing={false} {...handlers()} />);
    const icon = screen.getByRole("button", { name: "Customize" }).querySelector("svg");

    expect(icon?.querySelectorAll("rect")).toHaveLength(3);
    expect(icon?.querySelector(".lucide-pencil")?.parentElement).toBe(icon);
  });

  it("passes the board's background state to the tray and takes the choice back", () => {
    const actions = { ...handlers(), background: "off" as const };
    render(<BoardToolbar editing {...actions} />);

    fireEvent.click(appearanceButton());
    expect(screen.getByRole("radio", { name: "Off" })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("radio", { name: "On" }));
    expect(actions.onBackground).toHaveBeenCalledWith(true);
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

  it("opens the appearance choices in the menu itself, active while they show, and closes on a second press", () => {
    render(<BoardToolbar editing {...handlers()} />);
    expect(screen.queryByRole("radio", { name: "Compact" })).toBeNull();
    expect(appearanceButton()).toHaveAttribute("aria-expanded", "false");
    expect(appearanceButton()).toHaveClass("aria-expanded:text-primary-400");

    fireEvent.click(appearanceButton());

    expect(screen.getByRole("toolbar")).toContainElement(screen.getByRole("radio", { name: "Compact" }));
    expect(appearanceButton()).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(appearanceButton());

    expect(appearanceButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the appearance choices on Escape before Escape can leave edit mode", () => {
    render(<BoardToolbar editing {...handlers()} />);
    fireEvent.click(appearanceButton());
    const leave = vi.fn((event: KeyboardEvent) => event.defaultPrevented);
    window.addEventListener("keydown", leave);

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(appearanceButton()).toHaveAttribute("aria-expanded", "false");
    expect(leave).toHaveReturnedWith(true);
    window.removeEventListener("keydown", leave);
  });

  it("leaves Escape to a menu open above the tray, which stays open behind it", async () => {
    render(<BoardToolbar editing {...handlers()} />);
    fireEvent.click(appearanceButton());
    fireEvent.pointerDown(screen.getByRole("button", { name: "Add" }), { button: 0, ctrlKey: false });
    const menu = await screen.findByRole("menu");

    fireEvent.keyDown(menu, { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(appearanceButton()).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps the edit controls in place whatever the scroll", () => {
    const { scroller, scrollTo } = renderInScroller(true);
    scrollTo(scroller, 200);

    expect(screen.getByRole("button", { name: "Done" })).toBeVisible();
    expect(screen.getByRole("toolbar")).not.toHaveClass("opacity-0");
  });
});
