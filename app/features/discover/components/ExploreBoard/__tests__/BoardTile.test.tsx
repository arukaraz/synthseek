import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { BoardTile } from "../BoardTile";
import type { BoardTileActions, PlacedTile } from "../types";

vi.mock("../../TrendingHero/TrendingHero", () => ({
  TrendingHero: ({ size }: { size: string }) => <button type="button">{`widget ${size}`}</button>,
}));

const TILE: PlacedTile = {
  item: { id: "t", widget: "trending", size: "L" },
  size: "L",
  col: 0,
  row: 0,
  cols: 12,
  rows: 4,
};

function actions(): BoardTileActions {
  return { move: vi.fn(), resize: vi.fn(), remove: vi.fn(), startDrag: vi.fn() };
}

function renderTile(editing: boolean, handlers = actions()) {
  render(
    <BoardTile tile={TILE} device="wide" editing={editing} dragging={false} position={1} total={2} actions={handlers} />
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

  it("labels the focusable tile with its name and position and makes the widget inert in edit mode", () => {
    renderTile(true);

    expect(tileElement()).toHaveAttribute("tabindex", "0");
    expect(tileElement()).toHaveAccessibleName("Trending now, position 1 of 2");
    expect(screen.getByText("widget L").closest("[inert]")).not.toBeNull();
  });

  it("maps the tile's own keys to move, resize to the next size, and remove", () => {
    const handlers = renderTile(true);

    fireEvent.keyDown(tileElement(), { key: "ArrowRight" });
    fireEvent.keyDown(tileElement(), { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(tileElement(), { key: "Backspace" });

    expect(handlers.move).toHaveBeenCalledWith("t", 1);
    expect(handlers.resize).toHaveBeenCalledWith("t", "XL");
    expect(handlers.remove).toHaveBeenCalledWith("t");
  });

  it("leaves keys pressed on its controls to the controls", () => {
    const handlers = renderTile(true);

    fireEvent.keyDown(screen.getByRole("button", { name: "Large" }), { key: "ArrowLeft" });

    expect(handlers.move).not.toHaveBeenCalled();
  });
});
