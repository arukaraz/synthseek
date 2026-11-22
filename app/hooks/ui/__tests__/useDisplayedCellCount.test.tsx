import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDisplayedCellCount } from "../useDisplayedCellCount";

const resize = vi.hoisted(() => ({ callbacks: [] as Array<() => void> }));

class RecordingResizeObserver {
  constructor(callback: () => void) {
    resize.callbacks.push(callback);
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function Probe({ hiddenClass, extraCell = false }: { hiddenClass: string; extraCell?: boolean }) {
  const [ref, count] = useDisplayedCellCount<HTMLTableRowElement>();
  return (
    <>
      <p>{count === null ? "unmeasured" : `count ${count}`}</p>
      <table>
        <thead>
          <tr ref={ref}>
            {extraCell && <th>select</th>}
            <th>a</th>
            <th className={hiddenClass}>b</th>
            <th className="narrow-hidden">c</th>
          </tr>
        </thead>
      </table>
    </>
  );
}

let style: HTMLStyleElement;

beforeEach(() => {
  resize.callbacks = [];
  vi.stubGlobal("ResizeObserver", RecordingResizeObserver);
  style = document.createElement("style");
  style.textContent = ".gone { display: none; }";
  document.head.appendChild(style);
});

afterEach(() => {
  style.remove();
  vi.unstubAllGlobals();
});

describe("useDisplayedCellCount", () => {
  it("counts only the cells that are displayed", () => {
    render(<Probe hiddenClass="gone" />);

    expect(screen.getByText("count 2")).toBeInTheDocument();
  });

  it("counts again when the row resizes, as a breakpoint shows or hides a cell", () => {
    render(<Probe hiddenClass="gone" />);
    act(() => {
      style.textContent = ".gone, .narrow-hidden { display: none; }";
      resize.callbacks.forEach((callback) => callback());
    });

    expect(screen.getByText("count 1")).toBeInTheDocument();
  });

  it("counts again when a column is added after mount, with no resize", async () => {
    const { rerender } = render(<Probe hiddenClass="gone" />);
    rerender(<Probe hiddenClass="gone" extraCell />);

    expect(await screen.findByText("count 3")).toBeInTheDocument();
  });
});
