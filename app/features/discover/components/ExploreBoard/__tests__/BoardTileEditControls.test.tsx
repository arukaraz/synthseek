import { describe, expect, it, vi } from "vitest";

import type { BoardItem } from "@hooks/api/queries/board/types";
import { createWidgetPreset } from "@test/factories";
import { fireEvent, render, screen } from "@test/test-utils";

import { BoardTileEditControls } from "../BoardTileEditControls";
import type { BoardTileActions } from "../types";

vi.mock("@hooks/api/queries/widgets/useWidgetPresets", () => ({
  useWidgetPresets: () => ({ data: [createWidgetPreset({ key: "trending", builtin: "trending" })] }),
}));

function actions(): BoardTileActions {
  return { move: vi.fn(), resize: vi.fn(), remove: vi.fn(), startDrag: vi.fn(), customize: vi.fn() };
}

const ITEM: BoardItem = { kind: "builtin", id: "t", widget: "trending", size: "L" };

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

  it.each<[string, BoardItem]>([
    ["a builtin", { kind: "builtin", id: "o", widget: "onRepeat", size: "S" }],
    ["a custom", { kind: "custom", id: "c", widgetId: "w_1", size: "S" }],
  ])(
    "offers %s tile every size on a wide board and no size on a narrow one, where it always shows at M",
    (_kind, item) => {
      const { rerender } = render(
        <BoardTileEditControls item={item} device="wide" name="Mine" position={1} total={1} actions={actions()} />
      );
      const group = screen.getByRole("group", { name: "Size of Mine" });
      expect(Array.from(group.querySelectorAll("button"), (button) => button.textContent)).toEqual(["S", "M", "L"]);

      rerender(
        <BoardTileEditControls item={item} device="narrow" name="Mine" position={1} total={1} actions={actions()} />
      );
      expect(screen.queryByRole("group", { name: "Size of Mine" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Remove Mine" })).toBeInTheDocument();
    }
  );

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

  it("offers Customize only on a builtin tile that has a preset behind it", () => {
    const handlers = actions();
    const { rerender } = render(
      <BoardTileEditControls item={ITEM} device="wide" name="Trending" position={1} total={2} actions={handlers} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Customize Trending" }));
    expect(handlers.customize).toHaveBeenCalledWith("trending");

    rerender(
      <BoardTileEditControls
        item={{ kind: "builtin", id: "s", widget: "stations", size: "M" }}
        device="wide"
        name="Stations"
        position={1}
        total={2}
        actions={handlers}
      />
    );
    expect(screen.queryByRole("button", { name: "Customize Stations" })).not.toBeInTheDocument();
  });

  it("keeps the drag handle out of the tab order, since the arrows do its job from the keyboard", () => {
    render(
      <BoardTileEditControls item={ITEM} device="wide" name="Trending" position={1} total={2} actions={actions()} />
    );

    expect(screen.getByRole("button", { name: "Drag Trending" })).toHaveAttribute("tabindex", "-1");
  });
});
