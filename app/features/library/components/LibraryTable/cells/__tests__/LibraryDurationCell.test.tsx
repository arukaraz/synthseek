import { describe, it, expect } from "vitest";

import { render, screen } from "@test/test-utils";

import { LibraryDurationCell } from "../LibraryDurationCell";

describe("LibraryDurationCell", () => {
  it("renders a dash placeholder when the duration is zero or negative", () => {
    const { rerender } = render(<LibraryDurationCell durationMs={0} />);
    expect(screen.getByText("--")).toBeInTheDocument();

    rerender(<LibraryDurationCell durationMs={-100} />);
    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("formats a positive duration as minutes and seconds", () => {
    render(<LibraryDurationCell durationMs={185000} />);
    expect(screen.getByText("3:05")).toBeInTheDocument();
  });
});
