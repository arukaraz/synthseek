import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { render } from "@test/test-utils";

import { BOARD_FLIP_MS } from "../constants";
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

beforeEach(() => {
  positions.a = 0;
  positions.b = 120;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function rectOf(this: HTMLElement) {
    const x = positions[this.dataset.boardTile ?? ""] ?? 0;
    return DOMRect.fromRect({ x, y: 0, width: 100, height: 100 });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useBoardFlip", () => {
  it("slides a tile from where it was to where it is when the order changes, and reports settling meanwhile", () => {
    const { rerender } = render(<Board orderKey="a,b" skipId={null} />);
    const transitions: string[] = [];
    const observed = tile("b");
    const descriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, "transition");
    Object.defineProperty(observed.style, "transition", {
      configurable: true,
      get: () => descriptor?.get?.call(observed.style),
      set: (value: string) => {
        transitions.push(value);
        descriptor?.set?.call(observed.style, value);
      },
    });

    positions.b = 0;
    positions.a = 120;
    rerender(<Board orderKey="b,a" skipId={null} />);

    expect(transitions).toEqual(["none", `transform ${BOARD_FLIP_MS}ms ease`]);
    expect(tile("b").style.transform).toBe("");
    expect(tile("a").style.transition).toBe(`transform ${BOARD_FLIP_MS}ms ease`);
  });

  it("leaves the dragged tile and unmoved tiles alone", () => {
    const { rerender } = render(<Board orderKey="a,b" skipId="a" />);

    positions.a = 300;
    rerender(<Board orderKey="b,a" skipId="a" />);

    expect(tile("a").style.transition).toBe("none");
    expect(tile("b").style.transition).toBe("none");
  });

  it("does not animate when the order key is unchanged", () => {
    const { rerender } = render(<Board orderKey="a,b" skipId={null} />);

    positions.a = 300;
    rerender(<Board orderKey="a,b" skipId={null} />);

    expect(tile("a").style.transition).toBe("");
  });
});
