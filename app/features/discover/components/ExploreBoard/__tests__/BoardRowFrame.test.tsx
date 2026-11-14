import { describe, expect, it, vi } from "vitest";

import type { BoardRowHeight } from "@hooks/api/queries/board/types";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { BoardRowFrame } from "../BoardRowFrame";
import type { BoardRow } from "../types";

const ROW: BoardRow = {
  id: "a",
  position: 2,
  row: 5,
  rows: 5,
  height: "regular",
  sizable: true,
  itemIds: ["a", "b"],
};

function renderFrame(row: BoardRow = ROW) {
  const onHeight = vi.fn<(row: BoardRow, height: BoardRowHeight) => void>();
  render(<BoardRowFrame row={row} onHeight={onHeight} />);
  return { onHeight };
}

describe("BoardRowFrame", () => {
  it("names the row by its position and offers its three heights, the current one pressed", () => {
    renderFrame();

    expect(screen.getByText("Row 2")).toBeInTheDocument();
    const heights = within(screen.getByRole("group", { name: "Height of row 2" })).getAllByRole("button");
    expect(heights.map((button) => [button.textContent, button.getAttribute("aria-pressed")])).toEqual([
      ["Short", "false"],
      ["Regular", "true"],
      ["Tall", "false"],
    ]);
  });

  it("hands up the row and the height the member picks", () => {
    const { onHeight } = renderFrame();

    fireEvent.click(screen.getByRole("button", { name: "Tall" }));

    expect(onHeight.mock.calls).toEqual([[ROW, "tall"]]);
  });

  it("offers no height on a row of nothing but spacers, which keeps the rows its spacers ask for", () => {
    renderFrame({ ...ROW, sizable: false });

    expect(screen.getByText("Row 2")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Height of row 2" })).toBeNull();
  });

  it("spans every column over the grid rows of its row", () => {
    renderFrame();

    const frame = screen.getByText("Row 2").closest<HTMLElement>('[data-cy="board-row-frame"]');

    expect(frame?.style.getPropertyValue("--row-frame")).toBe("6 / span 5");
  });
});
