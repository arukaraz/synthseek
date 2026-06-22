import { render, screen } from "@test/test-utils";
import { describe, expect, it } from "vitest";

import { RequestsEmptyState } from "../RequestsEmptyState";

describe("RequestsEmptyState", () => {
  it("shows the no-requests state when there is no search query", () => {
    render(<RequestsEmptyState />);

    expect(screen.getByText("No Requests")).toBeInTheDocument();
    expect(screen.getByText("Your download requests will appear here.")).toBeInTheDocument();
  });

  it("shows the no-requests state for a blank search query", () => {
    render(<RequestsEmptyState searchQuery="   " />);

    expect(screen.getByText("No Requests")).toBeInTheDocument();
  });

  it("shows the no-results state including the query when searching", () => {
    render(<RequestsEmptyState searchQuery="daft punk" />);

    expect(screen.getByText("No Results")).toBeInTheDocument();
    expect(screen.getByText(/daft punk/)).toBeInTheDocument();
  });
});
