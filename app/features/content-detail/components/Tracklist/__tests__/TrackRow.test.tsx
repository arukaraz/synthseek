import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { TracklistTrack } from "../types";

import { TrackRow } from "../TrackRow";

function createTrack(overrides?: Partial<TracklistTrack>): TracklistTrack {
  return {
    externalId: "t1",
    title: "Get Lucky",
    artist: "Daft Punk",
    durationMs: 369000,
    trackNumber: 8,
    plays: null,
    inLibrary: false,
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
    ...overrides,
  };
}

const noop = () => {};

describe("TrackRow selection", () => {
  it("renders no checkbox when not selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        rank={1}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("renders a checkbox for a complete row when selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        rank={1}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onToggleSelect={noop}
      />
    );

    expect(screen.getByRole("checkbox", { name: /Select Get Lucky/i })).toBeInTheDocument();
  });

  it("renders a checkbox for a failed row when selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "failed" })}
        rank={1}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onToggleSelect={noop}
      />
    );

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders no checkbox for an in-flight row even when selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "downloading" })}
        rank={1}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onToggleSelect={noop}
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("fires onToggleSelect when the checkbox is clicked", async () => {
    const onToggleSelect = vi.fn();
    const { user } = renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        rank={1}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onToggleSelect={onToggleSelect}
      />
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onToggleSelect).toHaveBeenCalledTimes(1);
  });
});
