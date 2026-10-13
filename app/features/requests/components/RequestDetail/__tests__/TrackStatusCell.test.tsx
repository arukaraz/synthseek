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
  it("says the track comes with the album and how far the album has got", () => {
    releaseState.current = release();

    render(<TrackStatusCell track={makeRequestsTrack({ id: "track-1", status: RequestStatus.enum.downloading })} />);

    expect(screen.getByTestId("track-release-line")).toHaveTextContent("With the album by Torrent · 62%");
    expect(screen.getByText("Downloading")).toBeInTheDocument();
    expect(releaseState.askedFor).toContain("track-1");
  });

  it("calls a track waiting in its client's queue waiting rather than downloading", () => {
    releaseState.current = release({ state: "queued" });

    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.downloading })} />);

    expect(screen.getByTestId("track-release-line")).toHaveTextContent("Album lined up for Torrent");
    expect(screen.getByText("Pending Download")).toBeInTheDocument();
    expect(screen.queryByText("Downloading")).not.toBeInTheDocument();
  });

  it("keeps a track that already left the album phase on its own status", () => {
    releaseState.current = release({ state: "queued" });

    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.importing })} />);

    expect(screen.getByText("Importing")).toBeInTheDocument();
  });

  it("drops the album line once the track is complete or failed", () => {
    releaseState.current = release();

    const { rerender } = render(
      <TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.complete, acquisition_source: null })} />
    );
    expect(screen.queryByTestId("track-release-line")).not.toBeInTheDocument();

    rerender(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.failed })} />);
    expect(screen.queryByTestId("track-release-line")).not.toBeInTheDocument();
  });
});

describe("TrackStatusCell", () => {
  it("renders a status indicator for the track status", () => {
    const { container } = render(
      <TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.downloading })} />
    );

    expect(container.firstChild).not.toBeNull();
  });

  it("says which source a completed track came from, with what it was called there on hover", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.complete,
          acquisition_source: "usenet",
          acquisition_ref: "Artist - Album [FLAC]",
        })}
      />
    );

    expect(screen.getByText("via Usenet")).toHaveAttribute("title", "Artist - Album [FLAC]");
  });

  it("links the licence of a track that came with one, opening it in a new tab", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.complete,
          acquisition_source: "archive",
          acquisition_ref: "DWK155/Poldoore_-_02_-_Paradise.mp3",
          acquisition_license: "http://creativecommons.org/licenses/by-nc-nd/3.0/",
        })}
      />
    );

    expect(screen.getByText("via Internet Archive")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "licence" });
    expect(link).toHaveAttribute("href", "http://creativecommons.org/licenses/by-nc-nd/3.0/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows no licence link for a track without one", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.complete,
          acquisition_source: "usenet",
          acquisition_ref: "x",
        })}
      />
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("names a source it has no label for by its raw key", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.complete,
          acquisition_source: "napster",
          acquisition_ref: null,
        })}
      />
    );

    expect(screen.getByText("via napster")).not.toHaveAttribute("title");
  });

  it("says nothing about the source of a completed track that predates the record", () => {
    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.complete })} />);

    expect(screen.queryByText(/^via /)).not.toBeInTheDocument();
  });

  it("says nothing about the source of a track that is not complete", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          acquisition_source: "slskd",
          acquisition_ref: "x",
        })}
      />
    );

    expect(screen.queryByText(/^via /)).not.toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: /watching this track/i })).toBeInTheDocument();
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

    expect(screen.getByText(/3 attempts/)).toBeInTheDocument();
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
    expect(screen.getByText(/2 attempts/)).toBeInTheDocument();
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
