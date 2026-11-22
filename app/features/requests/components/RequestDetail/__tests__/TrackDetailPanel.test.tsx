import { RequestStatus, type ActiveRelease } from "@api/__generated__/types";
import { render, screen, userEvent, within } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { TrackDetailPanel } from "../TrackDetailPanel";
import type { TrackAction } from "../types";

const releaseState = vi.hoisted(() => ({ current: null as ActiveRelease | null }));
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@hooks/api/queries/useActiveReleases", () => ({
  useTrackRelease: () => releaseState.current,
}));

vi.mock("sonner", () => ({ toast: toastMock }));

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

function renderPanel(
  overrides: Parameters<typeof makeRequestsTrack>[0] = {},
  { actions = [], showPrivateDetails = true }: { actions?: TrackAction[]; showPrivateDetails?: boolean } = {}
) {
  const onAction = vi.fn();
  render(
    <TrackDetailPanel
      track={makeRequestsTrack(overrides)}
      showPrivateDetails={showPrivateDetails}
      actions={actions}
      onAction={onAction}
    />
  );
  return { onAction };
}

const obtained = () => within(screen.getByRole("region", { name: "Obtained" }));

beforeEach(() => {
  releaseState.current = null;
  vi.clearAllMocks();
});

describe("TrackDetailPanel head", () => {
  it("explains a failure by its reason", () => {
    renderPanel({ status: RequestStatus.enum.failed, failure_reason: "not_found" });

    expect(screen.getByText("Not found")).toBeInTheDocument();
    expect(screen.getByText(/wasn't found/)).toBeInTheDocument();
  });

  it("shows the raw error to someone allowed to see it", () => {
    renderPanel({ status: RequestStatus.enum.failed, error: "ETIMEDOUT 10.0.0.1" });

    expect(screen.getByText("Show the technical error")).toBeInTheDocument();
    expect(screen.getByText("ETIMEDOUT 10.0.0.1")).toBeInTheDocument();
  });

  it("hides the raw error from someone who is not", () => {
    renderPanel({ status: RequestStatus.enum.failed, error: "ETIMEDOUT 10.0.0.1" }, { showPrivateDetails: false });

    expect(screen.queryByText("ETIMEDOUT 10.0.0.1")).not.toBeInTheDocument();
  });

  it("tells a cancelled track apart from a failure", () => {
    renderPanel({ status: RequestStatus.enum.cancelled });

    expect(screen.getByText(/not a failure/i)).toBeInTheDocument();
  });

  it("uses the album's percentage for a track fetched with its release", () => {
    releaseState.current = release({ percent: 62 });
    renderPanel({ status: RequestStatus.enum.downloading, progress: 10 });

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "62");
  });

  it("uses the track's own progress when no release carries it", () => {
    renderPanel({ status: RequestStatus.enum.downloading, progress: 10 });

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");
  });

  it("calls a track waiting in its client's queue waiting, with no progress bar", () => {
    releaseState.current = release({ state: "queued" });
    renderPanel({ status: RequestStatus.enum.downloading });

    expect(screen.getByText("Pending Download")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});

describe("TrackDetailPanel obtained box", () => {
  it("names where a complete track came from, with its item and licence", () => {
    renderPanel({
      status: RequestStatus.enum.complete,
      acquisition_source: "archive",
      acquisition_ref: "DWK155/Poldoore_-_02_-_Paradise.mp3",
      acquisition_license: "http://creativecommons.org/licenses/by-nc-nd/3.0/",
    });

    expect(obtained().getByText(/Internet Archive/)).toBeInTheDocument();
    expect(obtained().getByText("DWK155/Poldoore_-_02_-_Paradise.mp3")).toBeInTheDocument();
    expect(obtained().getByRole("link", { name: "Licence" })).toHaveAttribute(
      "href",
      "http://creativecommons.org/licenses/by-nc-nd/3.0/"
    );
  });

  it("names the release a downloading track is fetched with", () => {
    releaseState.current = release();
    renderPanel({ status: RequestStatus.enum.downloading });

    expect(obtained().getByText("Torrent")).toBeInTheDocument();
    expect(obtained().getByText("Artist - Album")).toBeInTheDocument();
  });

  it("says a failed track got no usable file after its attempts", () => {
    renderPanel({ status: RequestStatus.enum.failed, retry_count: 3 });

    expect(obtained().getByText("3 attempts, none with a usable file")).toBeInTheDocument();
  });

  it("shows the file quality of what was imported", () => {
    renderPanel({
      status: RequestStatus.enum.complete,
      file_bitrate: 256,
      library_path: "Artist/Album/01.mp3",
      source_peer: "peer-name",
    });

    expect(obtained().getByText("256 kbps")).toBeInTheDocument();
    expect(obtained().getByText("peer-name")).toBeInTheDocument();
  });

  it("prefers the library path over the downloaded file and copies it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderPanel({
      status: RequestStatus.enum.complete,
      library_path: "Artist/Album/01.flac",
      downloaded_file: "/downloads/01.flac",
    });

    expect(obtained().getByText("Artist/Album/01.flac")).toBeInTheDocument();
    expect(obtained().queryByText("/downloads/01.flac")).not.toBeInTheDocument();
    await userEvent.click(obtained().getByRole("button", { name: "Copy path" }));

    expect(writeText).toHaveBeenCalledWith("Artist/Album/01.flac");
    expect(toastMock.success).toHaveBeenCalledWith("Path copied");
  });

  it("keeps the peer and the file path from someone who cannot manage the request", () => {
    renderPanel(
      {
        status: RequestStatus.enum.complete,
        source_peer: "peer-name",
        library_path: "Artist/Album/01.flac",
        file_bitrate: 256,
      },
      { showPrivateDetails: false }
    );

    expect(obtained().getByText("256 kbps")).toBeInTheDocument();
    expect(obtained().queryByText("peer-name")).not.toBeInTheDocument();
    expect(obtained().queryByText("Artist/Album/01.flac")).not.toBeInTheDocument();
    expect(obtained().queryByRole("button", { name: "Copy path" })).not.toBeInTheDocument();
  });

  it("reports a copy the browser refused", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    renderPanel({ status: RequestStatus.enum.complete, downloaded_file: "/downloads/01.flac" });

    await userEvent.click(obtained().getByRole("button", { name: "Copy path" }));

    expect(toastMock.error).toHaveBeenCalledWith("Could not copy the path");
  });
});

describe("TrackDetailPanel actions", () => {
  it("runs the action that was clicked", async () => {
    const { onAction } = renderPanel(
      { status: RequestStatus.enum.failed },
      {
        actions: [
          { id: "retry", lock: null },
          { id: "cancel", lock: null },
        ],
      }
    );

    await userEvent.click(screen.getByRole("button", { name: "Retry now" }));

    expect(onAction).toHaveBeenCalledWith("retry");
  });

  it("disables a locked action and says why", () => {
    renderPanel({ status: RequestStatus.enum.failed }, { actions: [{ id: "retry", lock: "ownerOrAdmin" }] });

    expect(screen.getByRole("button", { name: "Retry now" })).toBeDisabled();
    expect(screen.getByText("Only the person who requested it or an admin can change it")).toBeInTheDocument();
  });
});
