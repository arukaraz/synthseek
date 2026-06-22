import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { TopTracksList } from "../TopTracksList";
import type { TopTrackRowProps } from "../types";
import { createTopTrack } from "./fixtures";

vi.mock("../TopTrackRow", () => ({
  TopTrackRow: ({ track, rank }: TopTrackRowProps) => (
    <div data-testid="row" data-rank={rank}>
      {track.title}
    </div>
  ),
}));

describe("TopTracksList", () => {
  it("renders one row per track", () => {
    render(
      <TopTracksList
        tracks={[
          createTopTrack({ catalogTrackId: "a", title: "A" }),
          createTopTrack({ catalogTrackId: "b", title: "B" }),
          createTopTrack({ catalogTrackId: "c", title: "C" }),
        ]}
        startRank={2}
      />
    );

    expect(screen.getAllByTestId("row")).toHaveLength(3);
  });

  it("assigns ranks counting up from startRank by list position", () => {
    render(
      <TopTracksList
        tracks={[createTopTrack({ catalogTrackId: "a" }), createTopTrack({ catalogTrackId: "b" })]}
        startRank={2}
      />
    );

    const ranks = screen.getAllByTestId("row").map((row) => row.getAttribute("data-rank"));
    expect(ranks).toEqual(["2", "3"]);
  });

  it("renders nothing when the track list is empty", () => {
    render(<TopTracksList tracks={[]} startRank={2} />);

    expect(screen.queryByTestId("row")).not.toBeInTheDocument();
  });
});
