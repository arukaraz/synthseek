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
    mbid: null,
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
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));

    expect(screen.getByRole("menuitem", { name: "Retry track" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Jump the queue" })).not.toBeInTheDocument();
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
      />
    );

    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Jump the queue" }));

    expect(onPrioritize).toHaveBeenCalledOnce();
  });
});
