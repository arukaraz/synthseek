import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { BoardGrid } from "../BoardGrid";

describe("BoardGrid", () => {
  it("sets twelve columns on wide screens and four on narrow ones, with the shared row and gap", () => {
    const { rerender } = render(
      <BoardGrid device="wide">
        <span>tile</span>
      </BoardGrid>
    );
    const grid = screen.getByText("tile").parentElement;
    expect(grid?.style.getPropertyValue("--board-cols")).toBe("12");
    expect(grid?.style.getPropertyValue("--board-row")).toBe("72px");
    expect(grid?.style.getPropertyValue("--board-gap")).toBe("16px");

    rerender(
      <BoardGrid device="narrow">
        <span>tile</span>
      </BoardGrid>
    );
    expect(screen.getByText("tile").parentElement?.style.getPropertyValue("--board-cols")).toBe("4");
  });
});
