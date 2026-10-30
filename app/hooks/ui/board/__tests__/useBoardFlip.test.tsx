import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { render } from "@test/test-utils";

import { useBoardFlip } from "../useBoardFlip";

const positions: Record<string, number> = { a: 0, b: 120 };

function Board({ orderKey, skipId }: { orderKey: string; skipId: string | null }) {
  const flip = useBoardFlip({ orderKey, skipId });
  return (
    <div
      ref={(node) => {
        flip.ref.current = node;
      }}
      data-testid="board"
      data-settling={String(flip.settling())}
    >
      <div data-board-tile="a" />
      <div data-board-tile="b" />
    </div>
  );
}

function tile(id: string): HTMLElement {
  const node = document.querySelector(`[data-board-tile="${id}"]`);
  if (!(node instanceof HTMLElement)) throw new Error(`tile ${id} missing`);
  return node;
}

function animatedTiles(animate: { mock: { contexts: unknown[] } }): unknown[] {
  return animate.mock.contexts;
}

beforeEach(() => {
  positions.a = 0;
  positions.b = 120;
  HTMLElement.prototype.animate = vi.fn();
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function leftOf(this: HTMLElement) {
    return positions[this.dataset.boardTile ?? ""] ?? 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockReturnValue(0);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useBoardFlip", () => {
  it("slides a tile from where it was to where it is when the order changes", () => {
    const { rerender } = render(<Board orderKey="a,b" skipId={null} />);
    const animate = vi.spyOn(HTMLElement.prototype, "animate");

    positions.b = 0;
    positions.a = 120;
    rerender(<Board orderKey="b,a" skipId={null} />);

    expect(animatedTiles(animate)).toEqual([tile("a"), tile("b")]);
    expect(animate.mock.calls[1]?.[0]).toEqual([
      { transform: "translate(120px, 0px)" },
      { transform: "translate(0px, 0px)" },
    ]);
  });

  it("leaves the dragged tile and unmoved tiles alone", () => {
    const { rerender } = render(<Board orderKey="a,b" skipId="a" />);
    const animate = vi.spyOn(HTMLElement.prototype, "animate");

    positions.a = 300;
    rerender(<Board orderKey="b,a" skipId="a" />);

    expect(animate).not.toHaveBeenCalled();
  });

  it("does not animate when the order key is unchanged", () => {
    const { rerender } = render(<Board orderKey="a,b" skipId={null} />);
    const animate = vi.spyOn(HTMLElement.prototype, "animate");

    positions.a = 300;
    rerender(<Board orderKey="a,b" skipId={null} />);

    expect(animate).not.toHaveBeenCalled();
  });
});
