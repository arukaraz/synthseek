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

const SOURCE_INFO = "Where this track comes from";

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

  it("names the album's source in the details beside the status", async () => {
    releaseState.current = release();

    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.downloading })} />);
    await userEvent.setup().click(screen.getByRole("button", { name: SOURCE_INFO }));

    expect(await screen.findByText("via Torrent")).toBeInTheDocument();
    expect(screen.getByText("Artist - Album")).toBeInTheDocument();
  });

  it("drops the album's percentage and details once the track failed", () => {
    releaseState.current = release();

    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.failed })} />);

    expect(screen.queryByText("62%")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: SOURCE_INFO })).not.toBeInTheDocument();
  });
});

describe("TrackStatusCell", () => {
  it("renders a status indicator for the track status", () => {
    const { container } = render(
      <TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.downloading })} />
    );

    expect(container.firstChild).not.toBeNull();
  });

  it("keeps the status on one line, with the source and its licence behind the details button", async () => {
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

    expect(screen.queryByText("via Internet Archive")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: SOURCE_INFO }));

    expect(await screen.findByText("via Internet Archive")).toBeInTheDocument();
    expect(screen.getByText("DWK155/Poldoore_-_02_-_Paradise.mp3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Licence" })).toHaveAttribute(
      "href",
      "http://creativecommons.org/licenses/by-nc-nd/3.0/"
    );
  });

  it("offers no details for a completed track that predates the record", () => {
    render(<TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.complete })} />);

    expect(screen.queryByRole("button", { name: SOURCE_INFO })).not.toBeInTheDocument();
  });

  it("offers no details for a failed track, whatever source it last tried", () => {
    render(
      <TrackStatusCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.failed,
          acquisition_source: "slskd",
          acquisition_ref: "x",
        })}
      />
    );

    expect(screen.queryByRole("button", { name: SOURCE_INFO })).not.toBeInTheDocument();
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
