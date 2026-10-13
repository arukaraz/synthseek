import { RequestStatus, type ActiveRelease } from "@api/__generated__/types";
import { render, screen } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { TrackSourceCell } from "../TrackSourceCell";

const releaseState = vi.hoisted(() => ({ current: null as ActiveRelease | null }));

vi.mock("@hooks/api/queries/useActiveReleases", () => ({
  useTrackRelease: () => releaseState.current,
}));

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
});

describe("TrackSourceCell", () => {
  it("names the source of a completed track, with what it was called there on hover", () => {
    render(
      <TrackSourceCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.complete,
          acquisition_source: "usenet",
          acquisition_ref: "Artist - Album [FLAC]",
        })}
      />
    );

    expect(screen.getByText("Usenet")).toHaveAttribute("title", "Artist - Album [FLAC]");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("calls slskd Slskd", () => {
    render(
      <TrackSourceCell
        track={makeRequestsTrack({ status: RequestStatus.enum.complete, acquisition_source: "slskd" })}
      />
    );

    expect(screen.getByText("Slskd")).toBeInTheDocument();
  });

  it("links the licence of a track that came with one, opening it in a new tab", () => {
    render(
      <TrackSourceCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.complete,
          acquisition_source: "archive",
          acquisition_ref: "DWK155/Poldoore_-_02_-_Paradise.mp3",
          acquisition_license: "http://creativecommons.org/licenses/by-nc-nd/3.0/",
        })}
      />
    );

    expect(screen.getByText("Internet Archive")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Licence" });
    expect(link).toHaveAttribute("href", "http://creativecommons.org/licenses/by-nc-nd/3.0/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("names a source it has no label for by its raw key", () => {
    render(
      <TrackSourceCell
        track={makeRequestsTrack({
          status: RequestStatus.enum.complete,
          acquisition_source: "napster",
          acquisition_ref: null,
        })}
      />
    );

    expect(screen.getByText("napster")).not.toHaveAttribute("title");
  });

  it("names the album's source while the track still comes with it, queued or fetching", () => {
    releaseState.current = release({ state: "queued" });

    render(<TrackSourceCell track={makeRequestsTrack({ status: RequestStatus.enum.downloading })} />);

    expect(screen.getByText("Torrent")).toHaveAttribute("title", "Artist - Album");
  });

  it("shows a dash for a completed track that predates the record, and for a failed one", () => {
    releaseState.current = release();

    const { rerender } = render(<TrackSourceCell track={makeRequestsTrack({ status: RequestStatus.enum.complete })} />);
    expect(screen.getByText("-")).toBeInTheDocument();

    rerender(
      <TrackSourceCell track={makeRequestsTrack({ status: RequestStatus.enum.failed, acquisition_source: "slskd" })} />
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
