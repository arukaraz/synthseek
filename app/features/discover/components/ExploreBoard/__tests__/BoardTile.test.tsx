import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { BoardTile } from "../BoardTile";
import { customWidgetsById } from "../helpers";
import type { BoardTileActions, PlacedTile } from "../types";

const NO_CUSTOM = customWidgetsById([]);

const spies = vi.hoisted(() => ({ widget: vi.fn<() => void>(), info: vi.fn<() => void>() }));

vi.mock("../../TrendingHero/TrendingHero", () => ({
  TrendingHero: ({ size }: { size: string }) => (
    <div>
      <button type="button" onClick={spies.widget}>{`widget ${size}`}</button>
      <button type="button" data-info-tooltip="" onClick={spies.info}>
        info
      </button>
    </div>
  ),
}));

const TILE: PlacedTile = {
  item: { kind: "builtin", id: "t", widget: "trending", size: "L" },
  size: "L",
  col: 0,
  row: 0,
  cols: 12,
  rows: 4,
};

vi.mock("@hooks/api/queries/widgets/useWidgetPresets", () => ({ useWidgetPresets: () => ({ data: [] }) }));

function actions(): BoardTileActions {
  return {
    move: vi.fn(),
    moveToEdge: vi.fn(),
    resize: vi.fn(),
    resizeSpacer: vi.fn(),
    toggleBackground: vi.fn(),
    remove: vi.fn(),
    startDrag: vi.fn(),
    customize: vi.fn(),
    edit: vi.fn(),
  };
}

function renderTile(editing: boolean, handlers = actions()) {
  render(
    <BoardTile
      tile={TILE}
      device="wide"
      custom={NO_CUSTOM}
      customStatus="ready"
      editing={editing}
      dragging={false}
      position={1}
      total={2}
      actions={handlers}
    />
  );
  return handlers;
}

function tileElement(): HTMLElement {
  const element = document.querySelector("[data-board-tile='t']");
  if (!(element instanceof HTMLElement)) throw new Error("tile missing");
  return element;
}

describe("BoardTile", () => {
  it("renders the widget as a plain, unfocusable tile outside edit mode", () => {
    const handlers = renderTile(false);

    fireEvent.keyDown(tileElement(), { key: "Delete" });

    expect(screen.getByRole("button", { name: "widget L" })).toBeInTheDocument();
    expect(tileElement()).not.toHaveAttribute("tabindex");
    expect(handlers.remove).not.toHaveBeenCalled();
  });

  it("labels the focusable tile with its name and position and blocks the widget's own actions in edit mode", () => {
    spies.widget.mockClear();
    renderTile(true);

    expect(tileElement()).toHaveAttribute("tabindex", "0");
    expect(tileElement()).toHaveAccessibleName("Trending now, position 1 of 2");
    fireEvent.click(screen.getByRole("button", { name: "widget L" }));
    expect(spies.widget).not.toHaveBeenCalled();
  });

  it("still lets the widget's info icon answer in edit mode", () => {
    spies.info.mockClear();
    renderTile(true);

    fireEvent.click(screen.getByRole("button", { name: "info" }));

    expect(spies.info).toHaveBeenCalledTimes(1);
  });

  it("maps the tile's own keys to move, resize to the neighbouring size, and remove", () => {
    const handlers = renderTile(true);

    fireEvent.keyDown(tileElement(), { key: "ArrowRight" });
    fireEvent.keyDown(tileElement(), { key: "ArrowLeft", shiftKey: true });
    fireEvent.keyDown(tileElement(), { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(tileElement(), { key: "Backspace" });

    expect(handlers.move).toHaveBeenCalledWith("t", 1);
    expect(handlers.resize).toHaveBeenNthCalledWith(1, "t", "M");
    expect(handlers.resize).toHaveBeenNthCalledWith(2, "t", "S");
    expect(handlers.remove).toHaveBeenCalledWith("t");
  });

  it("turns into a named slot of its size while it is being dragged", () => {
    render(
      <BoardTile
        tile={TILE}
        device="wide"
        custom={NO_CUSTOM}
        customStatus="ready"
        editing
        dragging
        position={1}
        total={2}
        actions={actions()}
      />
    );

    expect(tileElement()).toHaveTextContent("Trending now");
    expect(tileElement()).toHaveTextContent("Large");
    expect(screen.getByRole("button", { name: "widget L" }).closest(".invisible")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Drag Trending now" })).not.toBeInTheDocument();
  });

  it("leaves keys pressed on its controls to the controls", () => {
    const handlers = renderTile(true);

    fireEvent.keyDown(screen.getByRole("button", { name: "Large" }), { key: "ArrowLeft" });

    expect(handlers.move).not.toHaveBeenCalled();
  });

  it("never labels a custom tile deleted in edit mode when its widget list failed to load", () => {
    const custom: PlacedTile = { ...TILE, item: { kind: "custom", id: "c", widgetId: "w_1", size: "M" }, size: "M" };
    render(
      <BoardTile
        tile={custom}
        device="wide"
        custom={NO_CUSTOM}
        customStatus="error"
        editing
        dragging={false}
        position={1}
        total={1}
        actions={actions()}
      />
    );

    expect(screen.queryByText(/Deleted widget/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Custom widget" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Custom widget, position 1 of 1" })).toBeInTheDocument();
  });
});
