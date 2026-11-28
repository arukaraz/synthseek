import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "../ProgressBar";

describe("ProgressBar as a progressbar", () => {
  it("exposes the percentage to assistive technology", () => {
    render(<ProgressBar progress={42.4} label="Download" />);

    const bar = screen.getByRole("progressbar", { name: "Download" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("holds the value inside the range whatever it is given", () => {
    const { rerender } = render(<ProgressBar progress={140} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    rerender(<ProgressBar progress={-3} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("keeps the drawing and its test hooks as they were", () => {
    render(<ProgressBar progress={50} isActive />);

    const bar = screen.getByTestId("progress-bar");
    expect(bar).toHaveAttribute("data-progress", "50");
    expect(bar.className).toContain("overflow-hidden");
  });
});
