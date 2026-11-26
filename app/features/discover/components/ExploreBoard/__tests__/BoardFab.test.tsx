import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { BoardFab } from "../BoardFab";
import type { BoardFabProps } from "../types";

function handlers(): Omit<BoardFabProps, "editing"> {
  return { onCustomize: vi.fn(), onDone: vi.fn() };
}

describe("BoardFab", () => {
  it("takes the pointer through its dock, which lets every other click pass", () => {
    render(<BoardFab editing={false} {...handlers()} />);
    const fab = screen.getByRole("button", { name: "Customize" });

    expect(fab).toHaveClass("pointer-events-auto");
    expect(fab.closest("[data-board-dock]")).toHaveClass("pointer-events-none");
  });

  it("renders on the page body, so a blurred ancestor cannot pull it off the bottom of the screen", () => {
    render(
      <main style={{ backdropFilter: "blur(4px)" }}>
        <BoardFab editing={false} {...handlers()} />
      </main>
    );

    expect(screen.getByRole("button", { name: "Customize" }).parentElement?.parentElement).toBe(document.body);
  });

  it("opens edit mode from the Customize button", () => {
    const actions = handlers();
    render(<BoardFab editing={false} {...actions} />);

    fireEvent.click(screen.getByRole("button", { name: "Customize" }));

    expect(actions.onCustomize).toHaveBeenCalledTimes(1);
    expect(actions.onDone).not.toHaveBeenCalled();
  });

  it("turns into Done while editing and leaves edit mode from there", () => {
    const actions = handlers();
    render(<BoardFab editing {...actions} />);

    expect(screen.queryByRole("button", { name: "Customize" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(actions.onDone).toHaveBeenCalledTimes(1);
    expect(actions.onCustomize).not.toHaveBeenCalled();
  });

  it("draws the pencil as part of the grid, with no badge of its own", () => {
    render(<BoardFab editing={false} {...handlers()} />);
    const icon = screen.getByRole("button", { name: "Customize" }).querySelector("svg");

    expect(icon?.querySelectorAll("rect")).toHaveLength(3);
    expect(icon?.querySelector(".lucide-pencil")?.parentElement).toBe(icon);
  });

  it("names Done for assistive tech but draws only its check mark", () => {
    render(<BoardFab editing {...handlers()} />);
    const done = screen.getByRole("button", { name: "Done" });

    expect(done).toHaveTextContent(/^$/);
    expect(done.querySelector(".lucide-check")).not.toBeNull();
  });
});
