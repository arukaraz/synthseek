import { ContentType, RequestStatus } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks, makeRequestsTrack, makeRequestsUser } from "../../../__tests__/factories";
import { RequestDetailTracks } from "../RequestDetailTracks";

const retryTrack = vi.fn();
const cancelTrack = vi.fn();
const prioritizeTrack = vi.fn();
const setWatch = vi.fn();
const upgradeRequest = vi.fn();
const confirmMock = vi.fn();

const authState = { canAct: true };

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { id: "user-1" } }),
}));

vi.mock("@utils/authorization", () => ({
  isOwnerOrAdminFE: () => authState.canAct,
}));

vi.mock("@utils/confirm", () => ({
  confirm: (...args: unknown[]) => confirmMock(...args),
}));

vi.mock("@hooks/api", () => ({
  useRetryTrack: () => ({ mutate: retryTrack }),
  useCancelTrack: () => ({ mutate: cancelTrack }),
  usePrioritizeTrack: () => ({ mutate: prioritizeTrack }),
  useSetWatch: () => ({ mutate: setWatch }),
  useApproveTracks: () => ({ mutate: vi.fn(), isPending: false }),
  useRejectTracks: () => ({ mutate: vi.fn(), isPending: false }),
  useRequest: () => ({ mutate: upgradeRequest, isPending: false }),
}));

describe("RequestDetailTracks", () => {
  beforeEach(() => {
    authState.canAct = true;
    confirmMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders a row per track with title and artist", () => {
    const request = makeRequestWithTracks({
      tracks: [
        makeRequestsTrack({ id: "t1", title: "First Song", artist: "Artist A" }),
        makeRequestsTrack({ id: "t2", title: "Second Song", artist: "Artist B" }),
      ],
    });

    render(<RequestDetailTracks request={request} />);

    expect(screen.getByText("First Song")).toBeInTheDocument();
    expect(screen.getByText("Second Song")).toBeInTheDocument();
    expect(screen.getByText("Artist A")).toBeInTheDocument();
  });

  it("shows the empty message when there are no tracks", () => {
    render(<RequestDetailTracks request={makeRequestWithTracks({ tracks: [] })} />);

    expect(screen.getByText("No tracks")).toBeInTheDocument();
  });

  it("retries a failed track from the row actions", async () => {
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      tracks: [makeRequestsTrack({ id: "t9", status: RequestStatus.enum.failed })],
    });

    render(<RequestDetailTracks request={request} />);
    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Retry track" }));

    expect(retryTrack).toHaveBeenCalledWith({ trackId: "t9" });
  });

  it("cancels a queued track only after confirmation", async () => {
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      tracks: [makeRequestsTrack({ id: "t3", status: RequestStatus.enum.queued })],
    });

    render(<RequestDetailTracks request={request} />);
    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Cancel track" }));

    expect(confirmMock).toHaveBeenCalledOnce();
    expect(cancelTrack).toHaveBeenCalledWith({ trackId: "t3" });
  });

  it("does not cancel when confirmation is declined", async () => {
    confirmMock.mockResolvedValue(false);
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      tracks: [makeRequestsTrack({ id: "t4", status: RequestStatus.enum.queued })],
    });

    render(<RequestDetailTracks request={request} />);
    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Cancel track" }));

    expect(confirmMock).toHaveBeenCalledOnce();
    expect(cancelTrack).not.toHaveBeenCalled();
  });

  it("stops the watch on a failed watched track from the row actions", async () => {
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      tracks: [makeRequestsTrack({ id: "t5", status: RequestStatus.enum.failed, watch_enabled: true })],
    });

    render(<RequestDetailTracks request={request} />);
    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Stop watching" }));

    expect(setWatch).toHaveBeenCalledWith({ trackId: "t5", enabled: false });
  });

  it("resumes the watch on a failed unwatched track from the row actions", async () => {
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      tracks: [makeRequestsTrack({ id: "t6", status: RequestStatus.enum.failed, watch_enabled: false })],
    });

    render(<RequestDetailTracks request={request} />);
    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Resume watching, reset the schedule" }));

    expect(setWatch).toHaveBeenCalledWith({ trackId: "t6", enabled: true });
  });

  it("retries a scheduled failed track from the Retry now affordance on the row", async () => {
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      tracks: [
        makeRequestsTrack({
          id: "t10",
          status: RequestStatus.enum.failed,
          watch_enabled: true,
          retry_count: 2,
          next_retry_at: new Date(Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
        }),
      ],
    });

    render(<RequestDetailTracks request={request} />);

    expect(screen.getByText(/Next attempt in 2h/)).toBeInTheDocument();
    expect(screen.getByText(/2 attempts/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry now" }));

    expect(retryTrack).toHaveBeenCalledWith({ trackId: "t10" });
  });

  it("hides the Retry now affordance when the user cannot act, keeping the schedule visible", () => {
    authState.canAct = false;
    const request = makeRequestWithTracks({
      tracks: [
        makeRequestsTrack({
          id: "t11",
          status: RequestStatus.enum.failed,
          watch_enabled: true,
          next_retry_at: new Date(Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
        }),
      ],
    });

    render(<RequestDetailTracks request={request} />);

    expect(screen.getByText(/Next attempt in 2h/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry now" })).not.toBeInTheDocument();
  });

  it("prioritizes a queued track from the jump-the-queue action", async () => {
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      tracks: [makeRequestsTrack({ id: "t7", status: RequestStatus.enum.queued, priority: 0 })],
    });

    render(<RequestDetailTracks request={request} />);
    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Jump the queue" }));

    expect(prioritizeTrack).toHaveBeenCalledWith({ trackId: "t7" });
  });

  it("dispatches an upgrade request with the track identity and its persisted config plus the upgrade flag", async () => {
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      contentType: ContentType.enum.album,
      external_id: "album-ext-1",
      tracks: [
        makeRequestsTrack({
          id: "t8",
          external_id: "track-ext-8",
          status: RequestStatus.enum.complete,
          isrc: "USRC17607839",
          bitrate: 256,
          format: "flac",
          format_matching: "strict",
          bitrate_matching: "flexible",
        }),
      ],
    });

    render(<RequestDetailTracks request={request} />);
    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Search better quality" }));

    expect(upgradeRequest).toHaveBeenCalledWith({
      track: {
        external_id: "track-ext-8",
        artist: "An Artist",
        title: "A Song",
        isrc: "USRC17607839",
        track_number: 1,
        disc_number: 1,
        duration_ms: 180000,
        explicit: false,
      },
      config: {
        bitrate: { value: 256, matching: "flexible" },
        format: { value: "flac", matching: "strict" },
        upgrade: true,
      },
      album_external_id: "album-ext-1",
    });
  });

  it("uses a synthetic single album id when upgrading a playlist track", async () => {
    const user = userEvent.setup();
    const request = makeRequestWithTracks({
      contentType: ContentType.enum.playlist,
      external_id: "playlist-ext-1",
      tracks: [makeRequestsTrack({ id: "t9", external_id: "track-ext-9", status: RequestStatus.enum.complete })],
    });

    render(<RequestDetailTracks request={request} />);
    await user.click(screen.getByRole("button", { name: "Track actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Search better quality" }));

    expect(upgradeRequest).toHaveBeenCalledWith(expect.objectContaining({ album_external_id: "single_track-ext-9" }));
  });

  it("hides the actions trigger when the user cannot act", () => {
    authState.canAct = false;
    const request = makeRequestWithTracks({
      tracks: [makeRequestsTrack({ id: "t5", status: RequestStatus.enum.failed })],
    });

    render(<RequestDetailTracks request={request} />);

    expect(screen.queryByRole("button", { name: "Track actions" })).not.toBeInTheDocument();
  });

  it("keeps the requester relationship intact for ownership checks", () => {
    const request = makeRequestWithTracks({
      requestedBy: makeRequestsUser({ id: "owner-7" }),
      tracks: [makeRequestsTrack({ id: "t6" })],
    });

    render(<RequestDetailTracks request={request} />);

    expect(screen.getByText("A Song")).toBeInTheDocument();
  });
});
