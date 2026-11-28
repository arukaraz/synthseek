import { ContentType, RequestStatus, type TrackRequest } from "@api/__generated__/types";
import { render, screen, userEvent, within } from "@test/test-utils";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks, makeRequestsTrack } from "../../../__tests__/factories";
import { RequestDetailTracks } from "../RequestDetailTracks";
import type { TrackSort } from "../types";

vi.mock("@hooks/api/queries/useActiveReleases", () => ({
  useTrackRelease: () => null,
}));

const review = vi.hoisted(() => ({ open: vi.fn() }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: true, currentUser: { id: "user-1" } }),
}));

vi.mock("@hooks/ui/useImportReviewLauncher", () => ({
  openImportReview: review.open,
}));

type Props = ComponentProps<typeof RequestDetailTracks>;

function renderTracks(tracks: TrackRequest[], overrides: Partial<Props> = {}) {
  const request = makeRequestWithTracks({ tracks });
  const props: Props = {
    request,
    tracks,
    visible: tracks,
    sort: null,
    onSort: vi.fn(),
    selectedIds: new Set(),
    onSelectionChange: vi.fn(),
    expandedId: null,
    onToggleExpanded: vi.fn(),
    permissions: { canManage: true, isAdmin: false },
    onAction: vi.fn(),
    ...overrides,
  };
  render(<RequestDetailTracks {...props} />);
  return props;
}

const rowOf = (trackId: string) => {
  const row = document.querySelector(`[data-track-id="${trackId}"]`);
  if (!(row instanceof HTMLElement)) throw new Error(`no row for ${trackId}`);
  return within(row);
};

const album = (tracks: TrackRequest[]) => makeRequestWithTracks({ contentType: ContentType.enum.album, tracks });

describe("RequestDetailTracks rows", () => {
  it("renders a row per visible track, with its title and artist", () => {
    const tracks = [
      makeRequestsTrack({ id: "t1", title: "First Song", credited_artist: "Artist A" }),
      makeRequestsTrack({ id: "t2", title: "Second Song", credited_artist: "Artist B" }),
    ];
    renderTracks(tracks, { visible: [tracks[1]] });

    expect(screen.getByText("Second Song")).toBeInTheDocument();
    expect(screen.getByText("Artist B")).toBeInTheDocument();
    expect(screen.queryByText("First Song")).not.toBeInTheDocument();
  });

  it("says the request has no tracks when it has none", () => {
    renderTracks([]);

    expect(screen.getByText("No tracks")).toBeInTheDocument();
  });

  it("says the filter matched nothing when the request has tracks but none are visible", () => {
    renderTracks([makeRequestsTrack()], { visible: [] });

    expect(screen.getByText("No tracks match this filter")).toBeInTheDocument();
  });

  it("numbers a playlist by its position, even when sorted", () => {
    const tracks = [
      makeRequestsTrack({ id: "a", title: "Zulu", track_number: 9 }),
      makeRequestsTrack({ id: "b", title: "Alpha", track_number: 4 }),
    ];
    renderTracks(tracks, { visible: [tracks[1], tracks[0]], sort: { key: "title", direction: "asc" } });

    expect(rowOf("a").getByText("1")).toBeInTheDocument();
    expect(rowOf("b").getByText("2")).toBeInTheDocument();
  });

  it("numbers an album by its track number", () => {
    const tracks = [makeRequestsTrack({ id: "a", track_number: 7 })];
    renderTracks(tracks, { request: album(tracks) });

    expect(rowOf("a").getByText("7")).toBeInTheDocument();
  });
});

describe("RequestDetailTracks discs", () => {
  const discs = [
    makeRequestsTrack({ id: "d1t1", disc_number: 1, track_number: 1 }),
    makeRequestsTrack({ id: "d2t1", disc_number: 2, track_number: 1 }),
  ];

  it("heads each disc of a multi-disc album in its canonical order", () => {
    renderTracks(discs, { request: album(discs) });

    expect(screen.getByText("Disc 1")).toBeInTheDocument();
    expect(screen.getByText("Disc 2")).toBeInTheDocument();
  });

  it("drops the disc headers once sorted, carrying the disc in the number instead", () => {
    const sort: TrackSort = { key: "title", direction: "asc" };
    renderTracks(discs, { request: album(discs), sort });

    expect(screen.queryByText("Disc 1")).not.toBeInTheDocument();
    expect(rowOf("d2t1").getByText("2.1")).toBeInTheDocument();
  });

  it("puts no disc header on a single-disc album", () => {
    const tracks = [makeRequestsTrack({ id: "a", disc_number: 1 })];
    renderTracks(tracks, { request: album(tracks) });

    expect(screen.queryByText("Disc 1")).not.toBeInTheDocument();
  });
});

describe("RequestDetailTracks selection", () => {
  const tracks = [makeRequestsTrack({ id: "a", title: "One" }), makeRequestsTrack({ id: "b", title: "Two" })];

  it("offers no selection to someone who can neither manage nor approve", () => {
    renderTracks(tracks, { permissions: { canManage: false, isAdmin: false } });

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("adds a track to the selection when its box is ticked", async () => {
    const props = renderTracks(tracks, { selectedIds: new Set(["a"]) });

    await userEvent.click(screen.getByRole("checkbox", { name: "Select Two" }));

    expect(props.onSelectionChange).toHaveBeenCalledWith(new Set(["a", "b"]));
  });

  it("selects every visible track from the header", async () => {
    const props = renderTracks(tracks);

    await userEvent.click(screen.getByRole("checkbox", { name: "Select every track shown" }));

    expect(props.onSelectionChange).toHaveBeenCalledWith(new Set(["a", "b"]));
  });

  it("clears the selection from the header when every visible track is selected", async () => {
    const props = renderTracks(tracks, { selectedIds: new Set(["a", "b"]) });

    await userEvent.click(screen.getByRole("checkbox", { name: "Select every track shown" }));

    expect(props.onSelectionChange).toHaveBeenCalledWith(new Set());
  });
});

describe("RequestDetailTracks sorting and details", () => {
  it("asks to sort by the column whose header was clicked", async () => {
    const props = renderTracks([makeRequestsTrack()]);

    await userEvent.click(screen.getByRole("button", { name: /^Artist/ }));

    expect(props.onSort).toHaveBeenCalledWith("artist");
  });

  it("opens a track's details from its row", async () => {
    const props = renderTracks([makeRequestsTrack({ id: "a", title: "One" })]);

    await userEvent.click(screen.getByRole("button", { name: /^One/, expanded: false }));

    expect(props.onToggleExpanded).toHaveBeenCalledWith("a");
  });

  it("opens the import review from a track that needs review without toggling its row", async () => {
    const props = renderTracks([
      makeRequestsTrack({ id: "a", title: "One", status: RequestStatus.enum.pending_import_review }),
    ]);
    review.open.mockClear();

    const [reviewButton] = screen.getAllByRole("button", { name: "Needs review: open the import review for One" });
    await userEvent.click(reviewButton);

    expect(review.open).toHaveBeenCalledWith("a");
    expect(props.onToggleExpanded).not.toHaveBeenCalled();
  });

  it("shows the details of the expanded track only", () => {
    const tracks = [makeRequestsTrack({ id: "a" }), makeRequestsTrack({ id: "b" })];
    renderTracks(tracks, { expandedId: "b" });

    expect(screen.getAllByRole("region", { name: "Requested" })).toHaveLength(1);
  });

  it("runs a row action against its own track", async () => {
    const tracks = [
      makeRequestsTrack({ id: "a", title: "One", status: RequestStatus.enum.complete }),
      makeRequestsTrack({ id: "b", title: "Two", status: RequestStatus.enum.failed }),
    ];
    const props = renderTracks(tracks);

    await userEvent.click(screen.getByRole("button", { name: "Actions for Two" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Retry now" }));

    expect(props.onAction).toHaveBeenCalledWith("retry", tracks[1]);
  });

  it("shows a non-manager the row actions locked", async () => {
    renderTracks([makeRequestsTrack({ title: "One", status: RequestStatus.enum.failed })], {
      permissions: { canManage: false, isAdmin: false },
    });

    await userEvent.click(screen.getByRole("button", { name: "Actions for One" }));

    expect(screen.getByRole("menuitem", { name: /Retry now/ })).toHaveAttribute("aria-disabled", "true");
  });
});
