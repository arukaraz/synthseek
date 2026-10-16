import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("../JobsCard", () => ({
  JobsCard: () => <div data-testid="jobs-card" />,
}));

import { JobsSection } from "../JobsSection";

afterEach(() => {
  cleanup();
});

describe("JobsSection", () => {
  it("renders the jobs card", () => {
    render(<JobsSection />);

    expect(screen.getByTestId("jobs-card")).toBeInTheDocument();
  });

  it("leaves the page header to the System layout and the library scan to the Library page", () => {
    const { container } = render(<JobsSection />);

    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(Array.from(container.children)).toEqual([screen.getByTestId("jobs-card")]);
  });
});
