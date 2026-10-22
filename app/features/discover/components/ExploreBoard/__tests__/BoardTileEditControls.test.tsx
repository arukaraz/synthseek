import { describe, expect, it, vi } from "vitest";

import type { BoardItem } from "@hooks/api/queries/board/types";
import { fireEvent, render, screen } from "@test/test-utils";

import { BoardTileEditControls } from "../BoardTileEditControls";
import type { BoardTileActions } from "../types";

function actions(): BoardTileActions {
  return { move: vi.fn(), resize: vi.fn(), remove: vi.fn(), startDrag: vi.fn() };
}

const ITEM: BoardItem = { id: "t", widget: "trending", size: "L" };

describe("BoardTileEditControls", () => {
  it("marks the current size and resizes to the chip that is pressed", () => {
    const handlers = actions();
    render(
      <BoardTileEditControls item={ITEM} device="wide" name="Trending" position={2} total={3} actions={handlers} />
    );

    expect(screen.getByRole("button", { name: "Large" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Medium" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "Medium" }));

    expect(handlers.resize).toHaveBeenCalledWith("t", "M");
  });

  it("moves earlier and later, and disables each button at its end of the board", () => {
    const handlers = actions();
    const { rerender } = render(
      <BoardTileEditControls item={ITEM} device="wide" name="Trending" position={2} total={3} actions={handlers} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Move Trending earlier" }));
    fireEvent.click(screen.getByRole("button", { name: "Move Trending later" }));
    expect(handlers.move).toHaveBeenNthCalledWith(1, "t", -1);
    expect(handlers.move).toHaveBeenNthCalledWith(2, "t", 1);

    rerender(
      <BoardTileEditControls item={ITEM} device="wide" name="Trending" position={1} total={1} actions={handlers} />
    );
    expect(screen.getByRole("button", { name: "Move Trending earlier" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move Trending later" })).toBeDisabled();
  });

  it("removes the tile and starts a drag from the handle", () => {
    const handlers = actions();
    render(
      <BoardTileEditControls item={ITEM} device="narrow" name="Trending" position={1} total={2} actions={handlers} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove Trending" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Drag Trending" }));

    expect(handlers.remove).toHaveBeenCalledWith("t");
    expect(handlers.startDrag).toHaveBeenCalledWith(expect.anything(), "t");
  });

  it("keeps the drag handle out of the tab order, since the arrows do its job from the keyboard", () => {
    render(
      <BoardTileEditControls item={ITEM} device="wide" name="Trending" position={1} total={2} actions={actions()} />
    );

    expect(screen.getByRole("button", { name: "Drag Trending" })).toHaveAttribute("tabindex", "-1");
  });

  it("offers exactly the sizes the widget supports", () => {
    render(
      <BoardTileEditControls item={ITEM} device="wide" name="Trending" position={1} total={2} actions={actions()} />
    );

    const group = screen.getByRole("group", { name: "Size of Trending" });
    expect(group.querySelectorAll("button")).toHaveLength(2);
  });

  it("shows no size chips on a widget that comes in one size only", () => {
    const item: BoardItem = { id: "r", widget: "rarities", size: "M" };
    render(
      <BoardTileEditControls item={item} device="wide" name="Rarities" position={1} total={2} actions={actions()} />
    );

    expect(screen.queryByRole("group", { name: "Size of Rarities" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Medium" })).not.toBeInTheDocument();
  });
});
