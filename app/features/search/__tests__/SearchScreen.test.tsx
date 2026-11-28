import { render, screen } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { SearchScreen } from "../SearchScreen";

vi.mock("../components/SearchResultsWidget/SearchResultsWidget", () => ({
  SearchResultsWidget: () => <div>results</div>,
}));

describe("SearchScreen", () => {
  it("heads the page with a level one heading that only assistive technology reads", () => {
    render(<SearchScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "Search" })).toHaveClass("sr-only");
    expect(screen.getByText("results")).toBeInTheDocument();
  });
});
