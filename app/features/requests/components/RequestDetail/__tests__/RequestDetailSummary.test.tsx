import { ContentType, RequestStatus, type TrackRequest } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks, makeRequestsTrack } from "../../../__tests__/factories";
import { RequestDetailSummary } from "../RequestDetailSummary";
import type { TrackGroup } from "../types";

const mixed = [
  makeRequestsTrack({ id: "1", status: RequestStatus.enum.complete }),
  makeRequestsTrack({ id: "2", status: RequestStatus.enum.complete }),
  makeRequestsTrack({ id: "3", status: RequestStatus.enum.downloading }),
  makeRequestsTrack({ id: "4", status: RequestStatus.enum.failed }),
  makeRequestsTrack({ id: "5", status: RequestStatus.enum.cancelled }),
];

function renderSummary({
  tracks = mixed,
  request = {},
  isResolving = false,
  filter = new Set<TrackGroup>(),
}: {
  tracks?: TrackRequest[];
  request?: Parameters<typeof makeRequestWithTracks>[0];
  isResolving?: boolean;
  filter?: ReadonlySet<TrackGroup>;
} = {}) {
  const onToggleFilter = vi.fn();
  const onClearFilter = vi.fn();
  render(
    <RequestDetailSummary
      request={makeRequestWithTracks({ tracks, ...request })}
      tracks={tracks}
      isResolving={isResolving}
      filter={filter}
      onToggleFilter={onToggleFilter}
      onClearFilter={onClearFilter}
    />
  );
  return { onToggleFilter, onClearFilter };
}

describe("RequestDetailSummary", () => {
  it("states done and in-progress tracks over the total", () => {
    renderSummary();

    expect(screen.getByLabelText("2 complete and 1 in progress out of 5")).toBeInTheDocument();
    expect(screen.getByText("2 complete, 1 in progress")).toBeInTheDocument();
  });

  it("draws one bar segment per present group, cancelled apart from failed", () => {
    renderSummary();

    expect(screen.getByRole("img")).toHaveAccessibleName("2 Complete, 1 In progress, 1 Failed, 1 Cancelled");
  });

  it("offers a filter chip per present group only", () => {
    renderSummary();

    const chips = screen.getAllByRole("button", { pressed: false });
    expect(chips.map((chip) => chip.getAttribute("data-filter"))).toEqual(["done", "active", "failed", "cancelled"]);
  });

  it("toggles the group of the chip that was pressed", async () => {
    const { onToggleFilter } = renderSummary();

    await userEvent.click(screen.getByRole("button", { name: /Cancelled/ }));

    expect(onToggleFilter).toHaveBeenCalledWith("cancelled");
  });

  it("marks the active chip pressed and offers to clear the filter", async () => {
    const { onClearFilter } = renderSummary({ filter: new Set<TrackGroup>(["failed"]) });

    expect(screen.getByRole("button", { name: /Failed/ })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Show all" }));

    expect(onClearFilter).toHaveBeenCalledOnce();
  });

  it("offers no clear while nothing is filtered", () => {
    renderSummary();

    expect(screen.queryByRole("button", { name: "Show all" })).not.toBeInTheDocument();
  });

  it("says how much of the album was asked for when only part of it was", () => {
    renderSummary({
      request: { contentType: ContentType.enum.album, total_tracks: 12, requested_tracks: 5 },
    });

    expect(screen.getByText(/you asked for 5 of 12 on the album/)).toBeInTheDocument();
  });

  it("counts the duplicates it skipped", () => {
    renderSummary({ request: { duplicateCount: 3 } });

    expect(screen.getByText(/3 duplicates ignored/)).toBeInTheDocument();
  });

  it("falls back to the request's own counts while the tracks resolve, with no bar or chips", () => {
    renderSummary({
      tracks: [],
      isResolving: true,
      request: { completed_tracks: 4, requested_tracks: 9, total_tracks: 9 },
    });

    expect(screen.getByLabelText("4 complete and 0 in progress out of 9")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("replaces the counts with a note for a delegated request", () => {
    renderSummary({ request: { status: RequestStatus.enum.delegated, delegated_to: "lidarr" } });

    expect(screen.getByText("Delegated to Lidarr")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
