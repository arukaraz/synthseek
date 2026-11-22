import { RequestStatus, type ActiveRelease } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { TrackStatusCell } from "../TrackStatusCell";

const releaseState = vi.hoisted(() => ({ current: null as ActiveRelease | null, askedFor: [] as string[] }));

vi.mock("@hooks/api/queries/useActiveReleases", () => ({
  useTrackRelease: (trackId: string) => {
    releaseState.askedFor.push(trackId);
    return releaseState.current;
  },
}));

const auth = vi.hoisted(() => ({ isAdmin: false, open: vi.fn() }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: auth.isAdmin, currentUser: { id: "user-1" } }),
}));

vi.mock("@hooks/ui/useImportReviewLauncher", () => ({
  openImportReview: auth.open,
}));

const inTwoHours = () => new Date(Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000);

function release(overrides: Partial<ActiveRelease> = {}): ActiveRelease {
  return {
    userId: "user-1",
    source: "torrent",
    releaseKey: "album|300",
    title: "Artist - Album",
    state: "fetching",
    percent: 62,
    doneBytes: 62,
    totalBytes: 100,
    etaMinutes: 1,
    albumIds: ["album-1"],
    trackRequestIds: ["track-1"],
    ...overrides,
  };
}

beforeEach(() => {
  releaseState.current = null;
  releaseState.askedFor = [];
});

describe("TrackStatusCell, with the album its track is fetched with", () => {
  it("shows how far the album has got on the status line itself", () => {
    releaseState.current = release();

    render(<TrackStatusCell track={makeRequestsTrack({ id: "track-1", status: RequestStatus.enum.downloading })} />);

    expect(screen.getByText("Downloading")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(releaseState.askedFor).toContain("track-1");
  });

  it("calls a track waiting in its client's queue waiting rather than downloading, with no percentage", () => {
    releaseState.current = release({ state: "queued" });

    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.downloading })} />);

    expect(screen.getByText("Pending Download")).toBeInTheDocument();
    expect(screen.queryByText("Downloading")).not.toBeInTheDocument();
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it("keeps a track that already left the album phase on its own status, without the album's percentage", () => {
    releaseState.current = release();

    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.importing })} />);

    expect(screen.getByText("Importing")).toBeInTheDocument();
    expect(screen.queryByText("62%")).not.toBeInTheDocument();
  });
});

describe("TrackStatusCell", () => {
  it("marks a prioritized queued track", () => {
    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.queued, priority: 6 })} />);

    expect(screen.getByText("Prioritized")).toBeInTheDocument();
  });

  it("marks nothing on a queued track without a priority", () => {
    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.queued, priority: 0 })} />);

    expect(screen.queryByText("Prioritized")).not.toBeInTheDocument();
  });

  it("says a failed watched track waits for the sweep before one is scheduled", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({ status: RequestStatus.enum.failed, watch_enabled: true, next_retry_at: null })}
      />
    );

    expect(screen.getByText("waiting for the next sweep")).toBeInTheDocument();
  });

  it("shows when a failed watched track tries again, with its attempt count", () => {
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

    expect(screen.getByText("next try in 2h")).toBeInTheDocument();
    expect(screen.getByText("attempt 3")).toBeInTheDocument();
  });

  it("says a failed unwatched track is not watched, and still counts its attempts", () => {
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

    expect(screen.getByText("not watched")).toBeInTheDocument();
    expect(screen.queryByText(/next try/)).not.toBeInTheDocument();
    expect(screen.getByText("attempt 2")).toBeInTheDocument();
  });

  it("shows no schedule on a track that has not failed", () => {
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

    expect(screen.queryByText(/next try/)).not.toBeInTheDocument();
    expect(screen.queryByText(/attempt/)).not.toBeInTheDocument();
  });
});

describe("TrackStatusCell, on a track that needs review", () => {
  beforeEach(() => {
    auth.isAdmin = true;
    auth.open.mockClear();
  });

  it("opens the import review at this track for an admin", async () => {
    const user = userEvent.setup();
    render(
      <TrackStatusCell
        track={makeRequestsTrack({ id: "track-9", title: "Lily", status: RequestStatus.enum.pending_import_review })}
      />
    );

    await user.click(screen.getByRole("button", { name: "Needs review: open the import review for Lily" }));

    expect(auth.open).toHaveBeenCalledWith("track-9");
  });

  it("keeps the status as plain text for someone who cannot review", () => {
    auth.isAdmin = false;
    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.pending_import_review })} />);

    expect(screen.getByText("Needs review")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open the import review/ })).not.toBeInTheDocument();
  });

  it("offers no review button on a track in any other status", () => {
    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.failed })} />);

    expect(screen.queryByRole("button", { name: /open the import review/ })).not.toBeInTheDocument();
  });
});
