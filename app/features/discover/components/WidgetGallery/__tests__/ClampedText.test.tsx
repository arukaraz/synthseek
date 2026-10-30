import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { ClampedText } from "../ClampedText";

function layout(scrollHeight: number, clientHeight: number) {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(scrollHeight);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(clientHeight);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ClampedText", () => {
  it("offers See more only when the text does not fit in its two lines", () => {
    layout(32, 32);
    render(<ClampedText text="Short" />);

    expect(screen.queryByRole("button", { name: "See more" })).toBeNull();
  });

  it("opens the whole text and closes it again", () => {
    layout(64, 32);
    render(<ClampedText text="A long description" />);
    const text = screen.getByText("A long description");
    expect(text).toHaveClass("line-clamp-2");

    fireEvent.click(screen.getByRole("button", { name: "See more" }));

    expect(text).not.toHaveClass("line-clamp-2");
    expect(screen.getByRole("button", { name: "See less" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "See less" }));

    expect(text).toHaveClass("line-clamp-2");
  });
});
