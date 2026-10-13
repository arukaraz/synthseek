import { ContentType, RequestStatus, type ActiveRelease } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks, makeRequestsUser } from "../../../__tests__/factories";
import { RequestSidebarItem } from "../RequestSidebarItem";

const releaseState = vi.hoisted(() => ({ current: null as ActiveRelease | null, askedFor: [] as string[] }));

vi.mock("@hooks/api/queries/useActiveReleases", () => ({
  useAlbumRelease: (albumId: string) => {
    releaseState.askedFor.push(albumId);
    return releaseState.current;
  },
}));

beforeEach(() => {
  releaseState.current = null;
  releaseState.askedFor = [];
});

function release(overrides: Partial<ActiveRelease> = {}): ActiveRelease {
  return {
    userId: "user-1",
    source: "usenet",
    releaseKey: "album|300",
    title: "Artist - Album",
    state: "fetching",
    percent: 40,
    doneBytes: 40,
    totalBytes: 100,
    etaMinutes: null,
    albumIds: ["album-1"],
    trackRequestIds: ["track-1"],
    ...overrides,
  };
}

describe("RequestSidebarItem, while its album is fetched as one release", () => {
  it("says how far the album has got", () => {
    releaseState.current = release();

    render(
      <RequestSidebarItem
        request={makeRequestWithTracks({ id: "album-1", contentType: ContentType.enum.album })}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByTestId("sidebar-release-line")).toHaveTextContent("Fetching album by Usenet · 40%");
    expect(releaseState.askedFor).toContain("album-1");
  });

  it("says the album is lined up while its client has no room", () => {
    releaseState.current = release({ state: "queued" });

    render(
      <RequestSidebarItem
        request={makeRequestWithTracks({ contentType: ContentType.enum.album })}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByTestId("sidebar-release-line")).toHaveTextContent("Lined up for Usenet");
  });

  it("says nothing for an album nothing is fetching, or for a playlist", () => {
    const { rerender } = render(
      <RequestSidebarItem
        request={makeRequestWithTracks({ contentType: ContentType.enum.album })}
        isSelected={false}
        onSelect={() => {}}
      />
    );
    expect(screen.queryByTestId("sidebar-release-line")).not.toBeInTheDocument();

    releaseState.current = release();
    releaseState.askedFor = [];
    rerender(
      <RequestSidebarItem
        request={makeRequestWithTracks({ contentType: ContentType.enum.playlist })}
        isSelected={false}
        onSelect={() => {}}
      />
    );
    expect(screen.queryByTestId("sidebar-release-line")).not.toBeInTheDocument();
    expect(releaseState.askedFor).toEqual([]);
  });
});

describe("RequestSidebarItem", () => {
  it("renders the name, artist, completed ratio and requester", () => {
    const request = makeRequestWithTracks({
      name: "Summer Mix",
      credited_artist: "Various",
      completed_tracks: 4,
      total_tracks: 12,
      requestedBy: makeRequestsUser({ username: "dj" }),
    });

    render(<RequestSidebarItem request={request} isSelected={false} onSelect={() => {}} />);

    expect(screen.getByText("Summer Mix")).toBeInTheDocument();
    expect(screen.getByText("Various")).toBeInTheDocument();
    expect(screen.getByText("4/12")).toBeInTheDocument();
    expect(screen.getByText(/dj/)).toBeInTheDocument();
  });

  it("marks the item active when selected", () => {
    render(<RequestSidebarItem request={makeRequestWithTracks()} isSelected onSelect={() => {}} />);

    expect(screen.getByTestId("sidebar-request-item")).toHaveAttribute("data-active", "true");
  });

  it("does not set the active attribute when unselected", () => {
    render(<RequestSidebarItem request={makeRequestWithTracks()} isSelected={false} onSelect={() => {}} />);

    expect(screen.getByTestId("sidebar-request-item")).not.toHaveAttribute("data-active");
  });

  it("exposes the request status through a data attribute", () => {
    render(
      <RequestSidebarItem
        request={makeRequestWithTracks({ status: RequestStatus.enum.complete })}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByTestId("sidebar-request-item")).toHaveAttribute("data-status", "complete");
  });

  it("renders the uppercased content-type label for an album", () => {
    render(
      <RequestSidebarItem
        request={makeRequestWithTracks({ contentType: ContentType.enum.album })}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText(/ALBUM/)).toBeInTheDocument();
  });

  it("paints the type word, and only the type word, in its content-type color", () => {
    render(
      <RequestSidebarItem
        request={makeRequestWithTracks({
          contentType: ContentType.enum.playlist,
          requestedBy: makeRequestsUser({ username: "dj" }),
        })}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText("PLAYLIST")).toHaveClass("type-text-playlist");
    expect(screen.getByText(/dj/)).not.toHaveClass("type-text-playlist");
  });

  it("calls onSelect when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<RequestSidebarItem request={makeRequestWithTracks()} isSelected={false} onSelect={onSelect} />);

    await user.click(screen.getByTestId("sidebar-request-item"));

    expect(onSelect).toHaveBeenCalledOnce();
  });
});
