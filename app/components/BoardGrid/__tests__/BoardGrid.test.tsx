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

  it("tightens or loosens rows and gaps with the density, and scales the type steps only off the default", () => {
    const { rerender } = render(
      <BoardGrid device="wide" appearance={{ density: "compact", text: "large" }}>
        <span>tile</span>
      </BoardGrid>
    );
    const grid = () => screen.getByText("tile").parentElement;
    expect(grid()?.style.getPropertyValue("--board-row")).toBe("64px");
    expect(grid()?.style.getPropertyValue("--board-gap")).toBe("12px");
    expect(grid()?.style.getPropertyValue("--text-sm")).toBe(`${0.875 * 1.08}rem`);

    rerender(
      <BoardGrid device="wide" appearance={{ density: "spacious", text: "default" }}>
        <span>tile</span>
      </BoardGrid>
    );
    expect(grid()?.style.getPropertyValue("--board-row")).toBe("80px");
    expect(grid()?.style.getPropertyValue("--board-gap")).toBe("24px");
    expect(grid()?.style.getPropertyValue("--text-sm")).toBe("");
  });

  it("lays its rows out from a template only when it is handed one", () => {
    const { rerender } = render(
      <BoardGrid device="wide">
        <span>tile</span>
      </BoardGrid>
    );
    const grid = () => screen.getByText("tile").parentElement;
    expect(grid()?.style.getPropertyValue("--board-template-rows")).toBe("");
    expect(grid()?.className).not.toContain("grid-rows-");

    rerender(
      <BoardGrid device="wide" templateRows="2rem repeat(4, var(--board-row))">
        <span>tile</span>
      </BoardGrid>
    );
    expect(grid()?.style.getPropertyValue("--board-template-rows")).toBe("2rem repeat(4, var(--board-row))");
    expect(grid()?.className).toContain("grid-rows-[var(--board-template-rows)]");
  });
});
