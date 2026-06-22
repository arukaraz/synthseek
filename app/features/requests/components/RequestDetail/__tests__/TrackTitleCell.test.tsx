import { RequestStatus } from "@api/__generated__/types";
import { render, screen } from "@test/test-utils";
import { describe, expect, it } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { TrackTitleCell } from "../TrackTitleCell";

describe("TrackTitleCell", () => {
  it("renders the track title", () => {
    render(<TrackTitleCell track={makeRequestsTrack({ title: "Midnight City" })} />);

    expect(screen.getByText("Midnight City")).toBeInTheDocument();
  });

  it("dims the title for a complete track", () => {
    render(<TrackTitleCell track={makeRequestsTrack({ status: RequestStatus.enum.complete })} />);

    expect(screen.getByText("A Song")).toHaveClass("text-fg/80");
  });

  it("further dims the title for a failed track", () => {
    render(<TrackTitleCell track={makeRequestsTrack({ status: RequestStatus.enum.failed })} />);

    expect(screen.getByText("A Song")).toHaveClass("text-fg/50");
  });

  it("uses the default emphasis for a queued track", () => {
    render(<TrackTitleCell track={makeRequestsTrack({ status: RequestStatus.enum.queued })} />);

    expect(screen.getByText("A Song")).toHaveClass("text-fg/90");
  });
});
