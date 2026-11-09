import { fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { onOwnClick, shieldOwnClick } from "../helpers";

const reachedDocument = vi.fn();

function Row({ onOpen }: { onOpen: () => void }) {
  return (
    <div data-testid="row" onClick={onOwnClick(onOpen)}>
      <span>Row title</span>
      <div onClick={shieldOwnClick}>
        <button type="button">Menu</button>
        {createPortal(<button type="button">Sheet item</button>, document.body)}
      </div>
    </div>
  );
}

describe("clicks that bubble through the React tree from a portal", () => {
  afterEach(() => {
    document.removeEventListener("click", reachedDocument);
    reachedDocument.mockReset();
  });

  it("opens the row from a tap on the row itself", () => {
    const onOpen = vi.fn();
    render(<Row onOpen={onOpen} />);

    fireEvent.click(screen.getByText("Row title"));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("keeps the menu trigger from opening the row", () => {
    const onOpen = vi.fn();
    render(<Row onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it("does not open the row from a tap inside a portaled sheet", () => {
    const onOpen = vi.fn();
    render(<Row onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button", { name: "Sheet item" }));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it("lets a tap inside a portaled sheet reach the document, where a dialog listens to dismiss on touch", () => {
    render(<Row onOpen={vi.fn()} />);
    document.addEventListener("click", reachedDocument);

    fireEvent.click(screen.getByRole("button", { name: "Sheet item" }));

    expect(reachedDocument).toHaveBeenCalledTimes(1);
  });
});
