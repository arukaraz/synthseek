import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, fireEvent, render, screen } from "@test/test-utils";

import { useBoardDrag } from "../useBoardDrag";

interface Item {
  id: string;
}

const ITEMS: Item[] = [{ id: "a" }, { id: "b" }, { id: "c" }];

const RECTS: Record<string, DOMRect> = {
  a: DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 100 }),
  b: DOMRect.fromRect({ x: 120, y: 0, width: 100, height: 100 }),
  c: DOMRect.fromRect({ x: 240, y: 0, width: 100, height: 100 }),
};

const drops = vi.fn<(order: Item[]) => void>();
const settling = vi.fn<() => boolean>(() => false);
const sameSlot = vi.fn<(a: Item, b: Item) => boolean>(() => false);

function Board({ items }: { items: Item[] }) {
  const { order, draggingId, startDrag } = useBoardDrag({ items, onDrop: drops, settling, sameSlot });
  return (
    <div>
      <p data-testid="order">{(order ?? items).map((item) => item.id).join("")}</p>
      <p data-testid="dragging">{draggingId ?? "none"}</p>
      {items.map((item) => (
        <div key={item.id} data-board-tile={item.id}>
          <button type="button" aria-label={`grip ${item.id}`} onPointerDown={(event) => startDrag(event, item.id)} />
        </div>
      ))}
    </div>
  );
}

function tileElement(id: string): HTMLElement {
  const tile = document.querySelector(`[data-board-tile="${id}"]`);
  if (!(tile instanceof HTMLElement)) throw new Error(`tile ${id} missing`);
  return tile;
}

function pointAt(id: string) {
  document.elementsFromPoint = vi.fn(() => [tileElement(id)]);
}

const frames: FrameRequestCallback[] = [];

function flushFrame() {
  const pending = frames.splice(0);
  pending.forEach((callback) => callback(0));
}

beforeEach(() => {
  frames.length = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function rectOf(this: HTMLElement) {
    return RECTS[this.dataset.boardTile ?? ""] ?? DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 });
  });
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
  drops.mockReset();
  settling.mockReset();
  settling.mockImplementation(() => false);
  sameSlot.mockReset();
  sameSlot.mockImplementation(() => false);
  document.body.innerHTML = "";
});

function startOn(id: string) {
  fireEvent.pointerDown(screen.getByLabelText(`grip ${id}`), { pointerId: 1, button: 0, clientX: 10, clientY: 10 });
}

function moveTo(id: string, clientX: number, clientY = 400) {
  pointAt(id);
  act(() => {
    fireEvent.pointerMove(window, { pointerId: 1, clientX, clientY });
    flushFrame();
  });
}

describe("useBoardDrag", () => {
  it("previews the new order while dragging and hands the whole list over on release", () => {
    render(<Board items={ITEMS} />);

    startOn("a");
    expect(screen.getByTestId("dragging")).toHaveTextContent("a");
    expect(document.querySelectorAll("body > [aria-hidden='true']")).toHaveLength(1);

    moveTo("c", 330);
    expect(screen.getByTestId("order")).toHaveTextContent("bca");

    act(() => {
      fireEvent.pointerUp(window, { pointerId: 1 });
    });

    expect(drops).toHaveBeenCalledTimes(1);
    expect(drops.mock.calls[0]?.[0].map((item) => item.id)).toEqual(["b", "c", "a"]);
    expect(screen.getByTestId("dragging")).toHaveTextContent("none");
    expect(document.querySelectorAll("body > [aria-hidden='true']")).toHaveLength(0);
  });

  it("restores the order and drops nothing when Escape cancels the drag", () => {
    render(<Board items={ITEMS} />);

    startOn("a");
    moveTo("c", 330);
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(drops).not.toHaveBeenCalled();
    expect(screen.getByTestId("order")).toHaveTextContent("abc");
    expect(screen.getByTestId("dragging")).toHaveTextContent("none");
  });

  it("keeps the Escape that cancels a drag from reaching the page's own Escape handlers", () => {
    const pageEscape = vi.fn();
    window.addEventListener("keydown", pageEscape);
    render(<Board items={ITEMS} />);

    startOn("a");
    act(() => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });
    window.removeEventListener("keydown", pageEscape);

    expect(pageEscape).not.toHaveBeenCalled();
  });

  it("drops nothing when the browser cancels the pointer", () => {
    render(<Board items={ITEMS} />);

    startOn("b");
    moveTo("a", 10);
    act(() => {
      fireEvent.pointerCancel(window, { pointerId: 1 });
    });

    expect(drops).not.toHaveBeenCalled();
    expect(screen.getByTestId("order")).toHaveTextContent("abc");
  });

  it("drops nothing when the tile is released where it started", () => {
    render(<Board items={ITEMS} />);

    startOn("b");
    act(() => {
      fireEvent.pointerUp(window, { pointerId: 1 });
    });

    expect(drops).not.toHaveBeenCalled();
  });

  it("ignores events from another pointer and secondary mouse buttons", () => {
    render(<Board items={ITEMS} />);

    fireEvent.pointerDown(screen.getByLabelText("grip a"), { pointerId: 1, button: 2, pointerType: "mouse" });
    expect(screen.getByTestId("dragging")).toHaveTextContent("none");

    startOn("a");
    act(() => {
      fireEvent.pointerUp(window, { pointerId: 9 });
    });
    expect(screen.getByTestId("dragging")).toHaveTextContent("a");
  });

  it("scrolls the board's scroll container while the pointer rests near its bottom edge", () => {
    const { container } = render(<Board items={ITEMS} />);
    const scroller = container.firstElementChild;
    if (!(scroller instanceof HTMLElement)) throw new Error("no scroller");
    scroller.style.overflowY = "auto";
    Object.defineProperty(scroller, "scrollHeight", { value: 3000 });
    Object.defineProperty(scroller, "clientHeight", { value: 600 });
    scroller.scrollTop = 500;
    scroller.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 0, width: 800, height: 600 });

    startOn("a");
    moveTo("a", 10, 590);

    expect(scroller.scrollTop).toBeGreaterThan(500);
  });

  it("holds the order while the pointer rests, until it travels again", () => {
    render(<Board items={ITEMS} />);

    startOn("a");
    moveTo("c", 330);
    expect(screen.getByTestId("order")).toHaveTextContent("bca");

    moveTo("b", 334);
    expect(screen.getByTestId("order")).toHaveTextContent("bca");

    moveTo("b", 130);
    expect(screen.getByTestId("order")).toHaveTextContent("abc");
  });

  it("does not reorder on the same target and side twice", () => {
    render(<Board items={ITEMS} />);

    startOn("a");
    moveTo("c", 330);
    moveTo("c", 360);
    moveTo("c", 300);

    expect(screen.getByTestId("order")).toHaveTextContent("bca");
    act(() => {
      fireEvent.pointerUp(window, { pointerId: 1 });
    });
    expect(drops).toHaveBeenCalledTimes(1);
  });

  it("ignores what lies under the pointer while the board is still sliding", () => {
    settling.mockImplementation(() => true);
    render(<Board items={ITEMS} />);

    startOn("a");
    moveTo("c", 330);

    expect(screen.getByTestId("order")).toHaveTextContent("abc");
  });

  it("swaps places with a tile that fills the same slot instead of inserting beside it", () => {
    sameSlot.mockImplementation((a, b) => a.id === "a" && b.id === "c");
    render(<Board items={ITEMS} />);

    startOn("a");
    moveTo("c", 250);

    expect(screen.getByTestId("order")).toHaveTextContent("cba");
  });

  it("cancels a drag in progress when the board unmounts", () => {
    const { unmount } = render(<Board items={ITEMS} />);

    startOn("a");
    unmount();

    expect(drops).not.toHaveBeenCalled();
    expect(document.querySelectorAll("body > [aria-hidden='true']")).toHaveLength(0);
  });
});
