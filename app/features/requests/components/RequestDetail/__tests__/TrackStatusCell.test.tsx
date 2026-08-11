import { RequestStatus } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { TrackStatusCell } from "../TrackStatusCell";

const inTwoHours = () => new Date(Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000);

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

  it("shows no scheduled attempt on a failed watched track before the sweep schedules one", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({ status: RequestStatus.enum.failed, watch_enabled: true, next_retry_at: null })}
      />
    );

    expect(screen.queryByText(/Next attempt/)).not.toBeInTheDocument();
  });

  it("shows the scheduled attempt on a failed watched track with a scheduled retry", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          watch_enabled: true,
          next_retry_at: inTwoHours(),
        })}
      />
    );

    expect(screen.getByText("Next attempt in 2h")).toBeInTheDocument();
  });

  it("surfaces the attempt count next to the schedule", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          watch_enabled: true,
          retry_count: 3,
          next_retry_at: inTwoHours(),
        })}
      />
    );

    expect(screen.getByText("3 attempts so far")).toBeInTheDocument();
  });

  it("still surfaces the attempt count on a failed track with watching disabled", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          watch_enabled: false,
          retry_count: 2,
          next_retry_at: inTwoHours(),
        })}
      />
    );

    expect(screen.queryByText(/Next attempt/)).not.toBeInTheDocument();
    expect(screen.getByText("2 attempts so far")).toBeInTheDocument();
  });

  it("shows no schedule on a non-failed watched track", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.downloading,
          watch_enabled: true,
          retry_count: 2,
          next_retry_at: inTwoHours(),
        })}
      />
    );

    expect(screen.queryByText(/Next attempt/)).not.toBeInTheDocument();
    expect(screen.queryByText(/attempts so far/)).not.toBeInTheDocument();
  });

  it("offers an immediate retry beside the schedule when a handler is supplied", async () => {
    const user = userEvent.setup();
    const onRetryNow = vi.fn();
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          watch_enabled: true,
          next_retry_at: inTwoHours(),
        })}
        onRetryNow={onRetryNow}
      />
    );

    await user.click(screen.getByRole("button", { name: "Retry now" }));

    expect(onRetryNow).toHaveBeenCalledOnce();
  });
});
