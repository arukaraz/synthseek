import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "@test/test-utils";

import { SHEET_DRAG } from "../constants";
import { useSheetDrag } from "../useSheetDrag";

interface Point {
  x: number;
  y: number;
}

function touch(target: Element, type: string, points: readonly Point[], time: number): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", { value: points.map((point) => ({ clientX: point.x, clientY: point.y })) });
  Object.defineProperty(event, "timeStamp", { value: time });
  target.dispatchEvent(event);
  return event;
}

function mountSheet(onDismiss = vi.fn()) {
  const sheet = document.createElement("div");
  Object.defineProperty(sheet, "offsetHeight", { value: 800 });
  const content = document.createElement("p");
  sheet.append(content);
  document.body.append(sheet);
  const hook = renderHook(({ dismiss }) => useSheetDrag({ onDismiss: dismiss }), {
    initialProps: { dismiss: onDismiss },
  });
  const detach = hook.result.current(sheet);
  return { sheet, content, onDismiss, hook, detach };
}

function drag(target: Element, path: readonly { y: number; t: number; x?: number }[]): Event[] {
  const [first, ...rest] = path;
  touch(target, "touchstart", [{ x: first.x ?? 0, y: first.y }], first.t);
  return rest.map((step) => touch(target, "touchmove", [{ x: step.x ?? 0, y: step.y }], step.t));
}

describe("useSheetDrag", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("returns nothing to clean up when detached", () => {
    const { result } = renderHook(() => useSheetDrag({ onDismiss: vi.fn() }));

    expect(result.current(null)).toBeUndefined();
  });

  it("does not dismiss a sheet that was detached while it slid away", () => {
    const { content, onDismiss, detach } = mountSheet();

    drag(content, [
      { y: 100, t: 0 },
      { y: 110, t: 100 },
      { y: 100 + SHEET_DRAG.DISMISS_DISTANCE_PX + 10, t: 2000 },
    ]);
    touch(content, "touchend", [], 2010);
    detach?.();
    vi.advanceTimersByTime(SHEET_DRAG.SETTLE_MS);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("follows a downward drag and takes the gesture from the page", () => {
    const { sheet, content } = mountSheet();

    const moves = drag(content, [
      { y: 100, t: 0 },
      { y: 110, t: 100 },
      { y: 180, t: 400 },
    ]);

    expect(sheet.style.transform).toBe("translateY(80px)");
    expect(sheet.style.transition).toBe("none");
    expect(moves.every((event) => event.defaultPrevented)).toBe(true);
  });

  it("dismisses after a drag past the distance threshold, once the sheet has slid away", () => {
    const { sheet, content, onDismiss } = mountSheet();

    drag(content, [
      { y: 100, t: 0 },
      { y: 110, t: 100 },
      { y: 100 + SHEET_DRAG.DISMISS_DISTANCE_PX + 10, t: 2000 },
    ]);
    touch(content, "touchend", [], 2010);

    expect(sheet.style.transform).toBe("translateY(100%)");
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(SHEET_DRAG.SETTLE_MS);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses after a short but fast flick", () => {
    const { content, onDismiss } = mountSheet();

    drag(content, [
      { y: 100, t: 0 },
      { y: 110, t: 100 },
      { y: 160, t: 110 },
    ]);
    touch(content, "touchend", [], 120);
    vi.advanceTimersByTime(SHEET_DRAG.SETTLE_MS);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("snaps back without dismissing after a short, slow drag", () => {
    const { sheet, content, onDismiss } = mountSheet();

    drag(content, [
      { y: 100, t: 0 },
      { y: 110, t: 100 },
      { y: 160, t: 1000 },
    ]);
    touch(content, "touchend", [], 1010);
    vi.advanceTimersByTime(SHEET_DRAG.SETTLE_MS * 2);

    expect(sheet.style.transform).toBe("");
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("treats a cancelled touch like a release", () => {
    const { sheet, content, onDismiss } = mountSheet();

    drag(content, [
      { y: 100, t: 0 },
      { y: 110, t: 100 },
      { y: 400, t: 2000 },
    ]);
    touch(content, "touchcancel", [], 2010);
    vi.advanceTimersByTime(SHEET_DRAG.SETTLE_MS);

    expect(sheet.style.transform).toBe("translateY(100%)");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls the latest dismiss callback", () => {
    const { content, onDismiss, hook } = mountSheet();
    const latest = vi.fn();
    hook.rerender({ dismiss: latest });

    drag(content, [
      { y: 100, t: 0 },
      { y: 110, t: 100 },
      { y: 400, t: 2000 },
    ]);
    touch(content, "touchend", [], 2010);
    vi.advanceTimersByTime(SHEET_DRAG.SETTLE_MS);

    expect(latest).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("waits for the finger to travel past the axis lock before moving the sheet", () => {
    const { sheet, content } = mountSheet();

    const [jitter] = drag(content, [
      { y: 100, t: 0 },
      { y: 100 + SHEET_DRAG.AXIS_LOCK_PX - 1, t: 50 },
    ]);

    expect(sheet.style.transform).toBe("");
    expect(jitter.defaultPrevented).toBe(false);
  });

  it("leaves an upward swipe to the content, even if it later turns downward", () => {
    const { sheet, content, onDismiss } = mountSheet();

    const moves = drag(content, [
      { y: 100, t: 0 },
      { y: 80, t: 100 },
      { y: 400, t: 200 },
    ]);
    touch(content, "touchend", [], 210);
    vi.advanceTimersByTime(SHEET_DRAG.SETTLE_MS);

    expect(sheet.style.transform).toBe("");
    expect(moves.some((event) => event.defaultPrevented)).toBe(false);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("leaves a mostly sideways swipe to the content", () => {
    const { sheet, content } = mountSheet();

    drag(content, [
      { y: 100, x: 0, t: 0 },
      { y: 110, x: 40, t: 100 },
    ]);

    expect(sheet.style.transform).toBe("");
  });

  it("does not drag from inside a no-drag zone", () => {
    const { sheet } = mountSheet();
    const zone = document.createElement("div");
    zone.setAttribute("data-sheet-no-drag", "");
    sheet.append(zone);

    drag(zone, [
      { y: 100, t: 0 },
      { y: 300, t: 100 },
    ]);

    expect(sheet.style.transform).toBe("");
  });

  it("ignores a second finger", () => {
    const { sheet, content } = mountSheet();

    touch(
      content,
      "touchstart",
      [
        { x: 0, y: 100 },
        { x: 50, y: 100 },
      ],
      0
    );
    touch(content, "touchmove", [{ x: 0, y: 300 }], 100);

    expect(sheet.style.transform).toBe("");
  });

  it("stops listening once detached", () => {
    const { sheet, content, detach } = mountSheet();
    detach?.();

    drag(content, [
      { y: 100, t: 0 },
      { y: 300, t: 100 },
    ]);
    touch(content, "touchend", [], 110);

    expect(sheet.style.transform).toBe("");
  });
});
