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
    album: null,
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
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={noop}
      />
    );

    expect(screen.getByRole("checkbox", { name: /Select Get Lucky/i })).toBeInTheDocument();
  });

  it("renders a checkbox for a failed row when selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "failed" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={noop}
      />
    );

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders no checkbox for an in-flight row even when selectable", () => {
    renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "downloading" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={noop}
      />
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("reports a plain click as a non-extending selection", async () => {
    const onSelectTrack = vi.fn();
    const { user } = renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={onSelectTrack}
      />
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onSelectTrack).toHaveBeenCalledTimes(1);
    expect(onSelectTrack).toHaveBeenCalledWith(false);
  });

  it("reports a shift click as an extending selection", async () => {
    const onSelectTrack = vi.fn();
    const { user } = renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={onSelectTrack}
      />
    );

    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("checkbox"));
    await user.keyboard("{/Shift}");

    expect(onSelectTrack).toHaveBeenCalledWith(true);
  });

  it("marks the row and the checkbox with the pending range tone", () => {
    const { container } = renderWithProviders(
      <TrackRow
        track={createTrack({ requestId: "r1", status: "complete" })}
        showArtist
        onRequest={noop}
        onRetry={noop}
        isRetrying={false}
        selectable
        isSelected={false}
        onSelectTrack={noop}
        previewTone="clear"
      />
    );

    expect(container.querySelector("li")).toHaveAttribute("data-range-preview", "clear");
    expect(screen.getByRole("checkbox").className).toContain("ring-fg/40");
  });
});
