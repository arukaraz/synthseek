import type { ActiveRelease } from "@api/__generated__/types";
import { render, screen } from "@test/test-utils";
import { describe, expect, it } from "vitest";

import { ReleaseProgressCard } from "../ReleaseProgressCard";

function release(overrides: Partial<ActiveRelease> = {}): ActiveRelease {
  return {
    userId: "user-1",
    source: "torrent",
    releaseKey: "album|300",
    title: "pandacd-609-across-town",
    state: "fetching",
    percent: 62,
    doneBytes: 201 * 1024 * 1024,
    totalBytes: 325 * 1024 * 1024,
    etaMinutes: 1,
    albumIds: ["album-1"],
    trackRequestIds: ["track-1"],
    ...overrides,
  };
}

describe("ReleaseProgressCard", () => {
  it("shows how far the album has got, how much of it, the time left and the release it fetches", () => {
    render(<ReleaseProgressCard release={release()} />);

    expect(screen.getByText("Fetching the album by Torrent")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveAttribute("data-progress", "62");
    expect(screen.getByText("201.0 MB of 325.0 MB · about 1 min left")).toBeInTheDocument();
    expect(screen.getByText("pandacd-609-across-town")).toHaveAttribute("title", "pandacd-609-across-town");
  });

  it("leaves out what it does not know yet: the size before the client reports it, the time left, the name", () => {
    render(<ReleaseProgressCard release={release({ totalBytes: 0, doneBytes: 0, etaMinutes: null, title: null })} />);

    expect(screen.getByText("Fetching the album by Torrent")).toBeInTheDocument();
    expect(screen.queryByText(/ of /)).not.toBeInTheDocument();
    expect(screen.queryByText(/min left/)).not.toBeInTheDocument();
    expect(screen.queryByText("pandacd-609-across-town")).not.toBeInTheDocument();
  });

  it("shows only the time left when the size is unknown, and only the size when the time is", () => {
    const { rerender } = render(<ReleaseProgressCard release={release({ totalBytes: 0 })} />);
    expect(screen.getByText("about 1 min left")).toBeInTheDocument();

    rerender(<ReleaseProgressCard release={release({ etaMinutes: null })} />);
    expect(screen.getByText("201.0 MB of 325.0 MB")).toBeInTheDocument();
  });

  it("says the album is lined up, with no progress, while its client has no room", () => {
    render(<ReleaseProgressCard release={release({ state: "queued", source: "usenet" })} />);

    expect(screen.getByTestId("release-progress")).toHaveAttribute("data-state", "queued");
    expect(screen.getByText("Lined up for Usenet")).toBeInTheDocument();
    expect(
      screen.getByText("Usenet is busy with other downloads. This one starts on its own as soon as it has room.")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("progress-bar")).not.toBeInTheDocument();
    expect(screen.queryByText("62%")).not.toBeInTheDocument();
  });
});
