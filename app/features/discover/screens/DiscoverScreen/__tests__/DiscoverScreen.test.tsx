import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { DiscoverScreen } from "../DiscoverScreen";

vi.mock("../../../components/ExploreBoard/ExploreBoard", () => ({
  ExploreBoard: () => <div data-testid="explore-board" />,
}));

describe("DiscoverScreen", () => {
  it("renders a screen-reader heading for the page", () => {
    render(<DiscoverScreen />);

    expect(screen.getByRole("heading", { name: "Discover" })).toBeInTheDocument();
  });

  it("composes the explore board", () => {
    render(<DiscoverScreen />);

    expect(screen.getByTestId("explore-board")).toBeInTheDocument();
  });
});
