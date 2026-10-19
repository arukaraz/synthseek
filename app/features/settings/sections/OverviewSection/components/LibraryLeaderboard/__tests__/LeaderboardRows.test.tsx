import { describe, it, expect } from "vitest";

import { render, screen } from "@test/test-utils";

import { LeaderboardRows } from "../LeaderboardRows";
import { TOP_LIMIT, TAB_MODES } from "../constants";

describe("LeaderboardRows", () => {
  it("renders nothing when there are no entries", () => {
    const { container } = render(<LeaderboardRows entries={[]} maxCount={10} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders ranked rows starting at position two", () => {
    render(
      <LeaderboardRows
        entries={[
          { name: "Second", count: 8, image: null },
          { name: "Third", count: 4, image: null },
        ]}
        maxCount={10}
      />
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("clamps the progress width to zero when maxCount is zero", () => {
    const { container } = render(<LeaderboardRows entries={[{ name: "Only", count: 5, image: null }]} maxCount={0} />);

    const fill = container.querySelector<HTMLDivElement>("[style*='width']");
    expect(fill?.style.width).toBe("0%");
  });
});

describe("LibraryLeaderboard constants", () => {
  it("limits the leaderboard to the top five entries", () => {
    expect(TOP_LIMIT).toBe(5);
  });

  it("exposes both tab modes in order", () => {
    expect(TAB_MODES).toEqual(["artists", "genres"]);
  });
});
