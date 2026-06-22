import { describe, it, expect } from "vitest";

import { render, screen } from "@test/test-utils";

import { LibraryCardGrid } from "../LibraryCardGrid";

describe("LibraryCardGrid", () => {
  it("renders its children inside a labelled list", () => {
    render(
      <LibraryCardGrid ariaLabel="Albums">
        <li>First</li>
        <li>Second</li>
      </LibraryCardGrid>
    );

    const list = screen.getByRole("list", { name: "Albums" });
    expect(list).toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
