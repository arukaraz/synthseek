import { render, screen } from "@testing-library/react";
import { Trash2 } from "lucide-react";
import { describe, expect, it } from "vitest";

import { IconButton } from "../IconButton";

const NAME = "Remove from queue";

const CASES = [
  { animated: true, size: "sm" },
  { animated: true, size: "md" },
  { animated: true, size: "lg" },
  { animated: false, size: "sm" },
  { animated: false, size: "md" },
  { animated: false, size: "lg" },
] as const;

describe("the icon button's visible name", () => {
  it.each(CASES)("is the accessible name itself, animated $animated, size $size", ({ animated, size }) => {
    render(<IconButton icon={Trash2} aria-label={NAME} animated={animated} size={size} />);

    const button = screen.getByRole("button", { name: NAME });
    const visible = button.querySelector("[data-icon-button-name]");

    expect(visible?.textContent).toBe(button.getAttribute("aria-label"));
  });

  it("follows the accessible name when the caller changes it", () => {
    const { rerender } = render(<IconButton icon={Trash2} aria-label="Delete" />);
    rerender(<IconButton icon={Trash2} aria-label="Remove" />);

    expect(screen.getByRole("button", { name: "Remove" }).querySelector("[data-icon-button-name]")?.textContent).toBe(
      "Remove"
    );
  });

  it("marks the button so the stylesheet can find it", () => {
    render(<IconButton icon={Trash2} aria-label={NAME} />);

    expect(screen.getByRole("button", { name: NAME })).toHaveAttribute("data-icon-button");
  });

  it("does not change what a screen reader announces", () => {
    render(<IconButton icon={Trash2} aria-label={NAME} />);

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button")).toHaveAccessibleName(NAME);
  });
});
