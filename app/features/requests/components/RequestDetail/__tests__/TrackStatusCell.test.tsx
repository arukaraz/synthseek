import { RequestStatus } from "@api/__generated__/types";
import { render, screen } from "@test/test-utils";
import { describe, expect, it } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { TrackStatusCell } from "../TrackStatusCell";

describe("TrackStatusCell", () => {
  it("renders a status indicator for the track status", () => {
    const { container } = render(
      <TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.downloading })} />
    );

    expect(container.firstChild).not.toBeNull();
  });

  it("renders for a failed track carrying a failure reason", () => {
    const { container } = render(
      <TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.failed, failure_reason: "not_found" })} />
    );

    expect(container.firstChild).not.toBeNull();
  });

  it("shows no watch hint on a failed watched track before the sweep schedules a retry", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({ status: RequestStatus.enum.failed, watch_enabled: true, next_retry_at: null })}
      />
    );

    expect(screen.queryByText(/Watching/)).not.toBeInTheDocument();
  });

  it("shows the next retry time on a failed watched track with a scheduled retry", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          watch_enabled: true,
          next_retry_at: new Date(Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
        })}
      />
    );

    expect(screen.getByText("Watching, next retry in 2h")).toBeInTheDocument();
  });

  it("surfaces the retry count through the hint tooltip", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          watch_enabled: true,
          retry_count: 3,
          next_retry_at: new Date(Date.now() + 60 * 60 * 1000),
        })}
      />
    );

    expect(screen.getByTitle("3 watch retries so far")).toBeInTheDocument();
  });

  it("shows no watch hint on a failed track with watching disabled", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          watch_enabled: false,
          next_retry_at: new Date(Date.now() + 60 * 60 * 1000),
        })}
      />
    );

    expect(screen.queryByText(/Watching/)).not.toBeInTheDocument();
  });

  it("shows no watch hint on a non-failed watched track", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.downloading,
          watch_enabled: true,
          next_retry_at: new Date(Date.now() + 60 * 60 * 1000),
        })}
      />
    );

    expect(screen.queryByText(/Watching/)).not.toBeInTheDocument();
  });
});
