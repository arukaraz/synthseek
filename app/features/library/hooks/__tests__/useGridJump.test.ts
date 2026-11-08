import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "@test/test-utils";

import { GRID_JUMP_MAX_FRAMES } from "../../constants";
import { useGridJump } from "../useGridJump";

const ROOT_TOP = 50;
const CARD_PX = 100;

function gridRoot(childCount: number): { root: HTMLElement; grid: HTMLElement } {
  const root = document.createElement("div");
  Object.defineProperty(root, "scrollTop", { value: 0, writable: true });
  root.getBoundingClientRect = () => new DOMRect(0, ROOT_TOP, 300, 600);
  const grid = document.createElement("div");
  grid.setAttribute("data-library-grid", "");
  root.append(grid);
  for (let index = 0; index < childCount; index += 1) addCard(grid);
  document.body.append(root);
  return { root, grid };
}

function addCard(grid: HTMLElement): void {
  const index = grid.children.length;
  const card = document.createElement("div");
  card.getBoundingClientRect = () => new DOMRect(0, ROOT_TOP + index * CARD_PX, 100, CARD_PX);
  grid.append(card);
}

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("useGridJump", () => {
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  async function nextFrame(): Promise<void> {
    for (const callback of frames.splice(0)) callback(0);
    await settle();
  }

  it("loads through the offset, then scrolls that card to the top of the scroll root", async () => {
    const { root } = gridRoot(10);
    const loadThrough = vi.fn(async () => undefined);
    const { result } = renderHook(() => useGridJump(root, loadThrough));

    await result.current(6);

    expect(loadThrough).toHaveBeenCalledWith(6);
    expect(root.scrollTop).toBe(6 * CARD_PX);
    expect(frames).toHaveLength(0);
  });

  it("waits frame by frame until the card has rendered", async () => {
    const { root, grid } = gridRoot(3);
    const { result } = renderHook(() => useGridJump(root, async () => undefined));

    let done = false;
    void result.current(4).then(() => {
      done = true;
    });
    await settle();
    await nextFrame();
    expect(done).toBe(false);
    expect(root.scrollTop).toBe(0);

    addCard(grid);
    addCard(grid);
    await nextFrame();

    expect(done).toBe(true);
    expect(root.scrollTop).toBe(4 * CARD_PX);
  });

  it("gives up after the frame budget when the card never renders", async () => {
    const { root } = gridRoot(1);
    const { result } = renderHook(() => useGridJump(root, async () => undefined));

    let done = false;
    void result.current(9).then(() => {
      done = true;
    });
    await settle();
    for (let frame = 0; frame < GRID_JUMP_MAX_FRAMES - 1; frame += 1) await nextFrame();
    expect(done).toBe(false);

    await nextFrame();

    expect(done).toBe(true);
    expect(frames).toHaveLength(0);
    expect(root.scrollTop).toBe(0);
  });

  it("abandons an earlier jump once a newer one starts", async () => {
    const { root, grid } = gridRoot(1);
    const { result } = renderHook(() => useGridJump(root, async () => undefined));

    void result.current(5);
    await settle();
    for (let index = 1; index < 6; index += 1) addCard(grid);
    await result.current(2);
    await nextFrame();

    expect(root.scrollTop).toBe(2 * CARD_PX);
  });

  it("only loads when there is no scroll root yet", async () => {
    const loadThrough = vi.fn(async () => undefined);
    const { result } = renderHook(() => useGridJump(null, loadThrough));

    await result.current(3);

    expect(loadThrough).toHaveBeenCalledWith(3);
    expect(frames).toHaveLength(0);
  });
});
