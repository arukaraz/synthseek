import { ContentType, RequestStatus, type TrackRequest } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { PriorityCell } from "../PriorityCell";
import { TrackActionsCell } from "../TrackActionsCell";

function makeTrack(overrides: Partial<TrackRequest> = {}): TrackRequest {
  return {
    id: "track-1",
    slskd_request_id: "slskd-1",
    external_id: "ext-track-1",
    user_id: "user-1",
    title: "A Song",
    artist: "An Artist",
    request_type: ContentType.enum.track,
    isrc: null,
    track_number: 1,
    disc_number: 1,
    duration_ms: 180000,
    status: RequestStatus.enum.queued,
    progress: 0,
    priority: 0,
    bitrate: 320,
    format: "mp3",
    format_matching: "flexible",
    bitrate_matching: "flexible",
    album_id: "album-1",
    error: null,
    explicit: false,
    source: "deezer",
    failure_reason: null,
    downloaded_file: null,
    retry_count: 0,
    next_retry_at: null,
    watch_enabled: true,
    source_peer: null,
    upgrade: false,
    created_at: new Date(),
    completed_at: null,
    updated_at: new Date(),
    ...overrides,
  };
}

const noop = () => {};

describe("RequestDetail PriorityCell", () => {
  it("renders the prioritized chip when priority is positive", () => {
    render(<PriorityCell track={makeTrack({ priority: 1 })} />);

    expect(screen.getByText("Prioritized")).toBeInTheDocument();
  });

  it("renders nothing when priority is zero", () => {
    const { container } = render(<PriorityCell track={makeTrack({ priority: 0 })} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("RequestDetail TrackActionsCell", () => {
  it("offers Jump the queue alongside cancel for a queued unprioritized track", async () => {
    const user = userEvent.setup();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.queued, priority: 0 })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.getByRole("menuitem", { name: "Jump the queue" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Cancel track" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Retry track" })).not.toBeInTheDocument();
  });

  it("hides Jump the queue for an already prioritized queued track", async () => {
    const user = userEvent.setup();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.queued, priority: 1 })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.queryByRole("menuitem", { name: "Jump the queue" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Cancel track" })).toBeInTheDocument();
  });

  it("offers Retry but not Jump the queue for a failed track", async () => {
    const user = userEvent.setup();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.failed, priority: 0 })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.getByRole("menuitem", { name: "Retry track" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Jump the queue" })).not.toBeInTheDocument();
  });

  it("renders a placeholder dash when no action applies to the track", () => {
    const { container } = render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.delegated, priority: 0 })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
      />
    );

    expect(screen.queryByRole("button", { name: "Track actions" })).not.toBeInTheDocument();
    expect(container).toHaveTextContent("-");
  });

  it("offers only Search better quality for a complete track", async () => {
    const user = userEvent.setup();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.complete })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
        onUpgrade={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.getByRole("menuitem", { name: "Search better quality" })).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
  });

  it("does not offer Search better quality on a non-complete track", async () => {
    const user = userEvent.setup();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.failed })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
        onUpgrade={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.queryByRole("menuitem", { name: "Search better quality" })).not.toBeInTheDocument();
  });

  it("calls onUpgrade when Search better quality is clicked", async () => {
    const user = userEvent.setup();
    const onUpgrade = vi.fn();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.complete })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
        onUpgrade={onUpgrade}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Search better quality" }));

    expect(onUpgrade).toHaveBeenCalledOnce();
  });

  it("hides the actions trigger on a complete track when the user cannot act", () => {
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.complete })}
        canAct={false}
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
        onUpgrade={noop}
      />
    );

    expect(screen.queryByRole("button", { name: "Track actions" })).not.toBeInTheDocument();
  });

  it("renders a placeholder dash when the user cannot act", () => {
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.queued, priority: 0 })}
        canAct={false}
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
      />
    );

    expect(screen.queryByRole("button", { name: "Track actions" })).not.toBeInTheDocument();
  });

  it("calls onPrioritize when Jump the queue is clicked", async () => {
    const user = userEvent.setup();
    const onPrioritize = vi.fn();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.queued, priority: 0 })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={onPrioritize}
        onSetWatch={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Jump the queue" }));

    expect(onPrioritize).toHaveBeenCalledOnce();
  });

  it("offers Stop watching on a failed watched track and calls onSetWatch(false)", async () => {
    const user = userEvent.setup();
    const onSetWatch = vi.fn();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.failed, watch_enabled: true })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={onSetWatch}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.queryByRole("menuitem", { name: "Resume watching, reset the schedule" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Stop watching" }));

    expect(onSetWatch).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("offers the reset-and-resume watch action on a failed unwatched track and calls onSetWatch(true)", async () => {
    const user = userEvent.setup();
    const onSetWatch = vi.fn();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.failed, watch_enabled: false })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={onSetWatch}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.queryByRole("menuitem", { name: "Stop watching" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Resume watching, reset the schedule" }));

    expect(onSetWatch).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("spells out that resuming a watch also clears the counter and the schedule", async () => {
    const user = userEvent.setup();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.failed, watch_enabled: false })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.getByRole("menuitem", { name: "Resume watching, reset the schedule" })).toHaveAttribute(
      "title",
      "Clears the attempt count and the scheduled time, so the next sweep retries this track."
    );
  });

  it("offers no watch action for a non-failed track", async () => {
    const user = userEvent.setup();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.queued, watch_enabled: true })}
        canAct
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.queryByRole("menuitem", { name: "Stop watching" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Resume watching, reset the schedule" })).not.toBeInTheDocument();
  });
});

describe("RequestDetail TrackActionsCell approval", () => {
  it("offers Approve and Reject to an admin on a pending_approval track", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    const onReject = vi.fn();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.pending_approval })}
        canAct
        canApprove
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
        onApprove={onApprove}
        onReject={onReject}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    await user.click(screen.getByRole("menuitem", { name: "Approve" }));
    expect(onApprove).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Reject" }));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it("shows only the waiting placeholder to a non-admin owner on a pending_approval track", () => {
    const { container } = render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.pending_approval })}
        canAct
        canApprove={false}
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
        onApprove={noop}
        onReject={noop}
      />
    );

    expect(screen.queryByRole("button", { name: "Track actions" })).not.toBeInTheDocument();
    expect(container).toHaveTextContent("-");
  });

  it("does not offer Approve on a track that is not pending approval", async () => {
    const user = userEvent.setup();
    render(
      <TrackActionsCell
        track={makeTrack({ status: RequestStatus.enum.queued })}
        canAct
        canApprove
        onRetry={noop}
        onCancel={noop}
        onPrioritize={noop}
        onSetWatch={noop}
        onApprove={noop}
        onReject={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.queryByRole("menuitem", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Reject" })).not.toBeInTheDocument();
  });
});
