import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { DiscoverScreen } from "../DiscoverScreen";

vi.mock("../../../components/ExploreBoard/ExploreBoard", () => ({
  ExploreBoard: () => <div data-testid="explore-board" />,
}));

vi.mock("../../../components/FinishSetupCard/FinishSetupCard", () => ({
  FinishSetupCard: () => <div data-testid="finish-setup-card" />,
}));

describe("DiscoverScreen", () => {
  it("puts the finish-setup card above the board", () => {
    render(<DiscoverScreen />);

    const card = screen.getByTestId("finish-setup-card");
    const board = screen.getByTestId("explore-board");

    expect(card.compareDocumentPosition(board) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders a screen-reader heading for the page", () => {
    render(<DiscoverScreen />);

    expect(screen.getByRole("heading", { name: "Discover" })).toBeInTheDocument();
  });

  it("composes the explore board", () => {
    render(<DiscoverScreen />);

    expect(screen.getByTestId("explore-board")).toBeInTheDocument();
  });
});
