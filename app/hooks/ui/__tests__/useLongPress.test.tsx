import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LONG_PRESS_CLICK_GRACE_MS, LONG_PRESS_MS } from "../constants";
import { useLongPress } from "../useLongPress";

function Holder({ onHold, onClick }: { onHold: (() => void) | undefined; onClick: () => void }) {
  const longPress = useLongPress(onHold);
  return (
    <ul>
      <li data-testid="row" onClick={onClick} {...longPress}>
        <span>Track</span>
        <button type="button">More</button>
      </li>
      <li data-testid="other" onClick={onClick}>
        Other
      </li>
    </ul>
  );
}

function setup(holds = true) {
  const onClick = vi.fn();
  const onHold = holds ? vi.fn() : undefined;
  render(<Holder onHold={onHold} onClick={onClick} />);
  return { onHold, onClick, row: screen.getByTestId("row") };
}

function press(target: Element, pointerType = "touch") {
  fireEvent.pointerDown(target, { pointerType, clientX: 20, clientY: 20 });
}

function elapse(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  fireEvent.pointerDown(document.body);
  vi.useRealTimers();
});

describe("useLongPress", () => {
  it("holds once a finger stays down long enough, and not before", () => {
    const { onHold } = setup();

    press(screen.getByText("Track"));
    elapse(LONG_PRESS_MS - 1);
    expect(onHold).not.toHaveBeenCalled();
    elapse(1);

    expect(onHold).toHaveBeenCalledTimes(1);
  });

  it("is not a hold when the finger lifts early", () => {
    const { onHold, row } = setup();

    press(row);
    fireEvent.pointerUp(row);
    elapse(LONG_PRESS_MS);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("is not a hold when the finger moves off into a scroll", () => {
    const { onHold, row } = setup();

    press(row);
    fireEvent.pointerMove(row, { clientX: 20, clientY: 40 });
    elapse(LONG_PRESS_MS);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("keeps the hold through a finger's small wobble", () => {
    const { onHold, row } = setup();

    press(row);
    fireEvent.pointerMove(row, { clientX: 24, clientY: 26 });
    elapse(LONG_PRESS_MS);

    expect(onHold).toHaveBeenCalledTimes(1);
  });

  it("is not a hold when the browser takes the gesture over", () => {
    const { onHold, row } = setup();

    press(row);
    fireEvent.pointerCancel(row);
    elapse(LONG_PRESS_MS);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("leaves a mouse alone, which has its own ways to select", () => {
    const { onHold, row } = setup();

    press(row, "mouse");
    elapse(LONG_PRESS_MS);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("leaves a press on a control inside the row to that control", () => {
    const { onHold } = setup();

    press(screen.getByRole("button", { name: "More" }));
    elapse(LONG_PRESS_MS);

    expect(onHold).not.toHaveBeenCalled();
  });

  it("does nothing without a hold to run", () => {
    const { onClick, row } = setup(false);

    press(row);
    elapse(LONG_PRESS_MS);
    fireEvent.click(row);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("swallows the click the hold leaves behind, wherever the layout moved it to", () => {
    const { onClick, row } = setup();

    press(row);
    elapse(LONG_PRESS_MS);
    fireEvent.click(screen.getByTestId("other"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("lets the next tap through once a new touch starts", () => {
    const { onClick, row } = setup();
    press(row);
    elapse(LONG_PRESS_MS);

    const other = screen.getByTestId("other");
    fireEvent.pointerDown(other, { pointerType: "touch" });
    fireEvent.click(other);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("lets a later click through once the finger has lifted, with no new touch before it", () => {
    const { onClick, row } = setup();
    press(row);
    elapse(LONG_PRESS_MS);
    fireEvent.pointerUp(row);

    elapse(LONG_PRESS_CLICK_GRACE_MS);
    fireEvent.click(screen.getByTestId("other"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("still swallows the click that follows the lift at once", () => {
    const { onClick, row } = setup();
    press(row);
    elapse(LONG_PRESS_MS);

    fireEvent.pointerUp(row);
    fireEvent.click(row);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps the browser's own long-press menu away while it holds", () => {
    const { row } = setup();
    press(row);

    expect(fireEvent.contextMenu(row)).toBe(false);
    elapse(LONG_PRESS_MS);
    expect(fireEvent.contextMenu(row)).toBe(false);
  });
});
