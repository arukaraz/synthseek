import { RequestStatus } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks, makeRequestsTrack, makeRequestsUser } from "../../../__tests__/factories";
import { RequestDetailTracks } from "../RequestDetailTracks";

const retryTrack = vi.fn();
const cancelTrack = vi.fn();
const prioritizeTrack = vi.fn();
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
