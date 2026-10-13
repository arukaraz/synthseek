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

  it("explains that older downloads record no source when a chosen source has nothing", () => {
    render(<RequestsEmptyState emptySourceLabel="Slskd" filtered />);

    expect(screen.getByText("Nothing from Slskd yet")).toBeInTheDocument();
    expect(screen.getByText(/downloaded before this version don't record their source/)).toBeInTheDocument();
    expect(screen.queryByText("No Requests")).not.toBeInTheDocument();
  });

  it("says the filters hide everything rather than that there are no requests", () => {
    render(<RequestsEmptyState filtered />);

    expect(screen.getByText("No matching requests")).toBeInTheDocument();
    expect(screen.queryByText("No Requests")).not.toBeInTheDocument();
  });

  it("keeps the search message ahead of the filter messages", () => {
    render(<RequestsEmptyState searchQuery="daft punk" emptySourceLabel="Slskd" filtered />);

    expect(screen.getByText("No Results")).toBeInTheDocument();
  });
});
