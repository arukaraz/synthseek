import { afterEach, describe, expect, it, vi } from "vitest";

import type { BoardSize } from "@hooks/api/queries/board/types";
import type { WidgetBlock, WidgetResult } from "@hooks/api/queries/widgets/types";
import {
  createAlbumResult,
  createBucketResult,
  createFeedAlbumResult,
  createFeedAlbumRow,
  createQuestionAlbumRow,
  createQuestionTrackRow,
  createTrackResult,
  createWidget,
} from "@test/factories";
import { fireEvent, renderWithProviders, screen, within } from "@test/test-utils";

import { CustomWidget } from "../CustomWidget";

const { dataQuery, playEntity, requestResult, measured } = vi.hoisted(() => ({
  dataQuery: vi.fn(),
  playEntity: vi.fn(),
  requestResult: vi.fn(),
  measured: { width: 0 },
}));

vi.mock("@hooks/api/queries/widgets/useWidgetData", () => ({ useWidgetData: () => dataQuery() }));
vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity }) }));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: vi.fn(), requestResult }),
}));
vi.mock("@hooks/ui/useElementWidth", () => ({ useElementWidth: () => [vi.fn(), measured.width] }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

const TRACKS = createTrackResult(
  Array.from({ length: 14 }, (_, index) =>
    createQuestionTrackRow({ id: `t${index}`, trackId: `req-${index}`, title: `Song ${index}` })
  )
);
const ALBUMS = createAlbumResult(
  Array.from({ length: 12 }, (_, index) =>
    createQuestionAlbumRow({ id: `a${index}`, albumExternalId: `dz-${index}`, name: `Album ${index}` })
  )
);
const BUCKETS = createBucketResult([
  { key: "rock", label: "Rock", value: 12, prev: 9 },
  { key: "jazz", label: "Jazz", value: 7, prev: 7 },
  { key: "pop", label: "Pop", value: 4, prev: 6 },
  { key: "folk", label: "Folk", value: 2, prev: null },
  { key: "soul", label: "Soul", value: 1, prev: null },
]);

function show(block: WidgetBlock, size: BoardSize, result: WidgetResult, action: "play" | "request" | "none" = "play") {
  dataQuery.mockReturnValue({ data: result, isLoading: false, isError: false });
  renderWithProviders(<CustomWidget widget={createWidget({ view: { block, action } })} status="ready" size={size} />);
}

afterEach(() => {
  vi.clearAllMocks();
  measured.width = 0;
});

describe("CustomWidget", () => {
  it("frames the widget with its own name and description", () => {
    show("list", "M", TRACKS);
    expect(screen.getByRole("heading", { level: 3, name: "Most played" })).toBeInTheDocument();
    expect(screen.getByText("Your month")).toBeInTheDocument();
  });

  it.each([
    ["S", 5],
    ["M", 8],
    ["L", 12],
  ] as const)("lists as many rows as a %s list holds", (size, rows) => {
    show("list", size, TRACKS);
    expect(screen.getAllByRole("listitem")).toHaveLength(rows);
  });

  it("plays a listed track from its cover", () => {
    show("list", "M", TRACKS);
    fireEvent.click(screen.getByRole("button", { name: "Play Song 0" }));
    expect(playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["req-0"] });
  });

  it("requests an album from a card when the widget asks for requests", () => {
    measured.width = 640;
    show("cards", "M", ALBUMS, "request");
    expect(screen.getAllByRole("article")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Request Album 0" }));
    expect(requestResult).toHaveBeenCalledWith(expect.objectContaining({ id: "dz-0", type: "album" }));
  });

  it.each([
    ["S", 2],
    ["M", 12],
    ["L", 12],
  ] as const)("shows %s rail cards", (size, cards) => {
    show("rail", size, ALBUMS);
    expect(screen.getAllByRole("article")).toHaveLength(cards);
  });

  it.each([
    ["S", 0],
    ["M", 6],
    ["L", 8],
  ] as const)("keeps the leader at %s with %s rows below it", (size, rows) => {
    show("leader", size, TRACKS);
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("Song 0")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(rows);
  });

  it("shows the first bucket as one number with its change", () => {
    show("stat", "M", BUCKETS, "none");
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3 more than the previous period")).toBeInTheDocument();
  });

  it("drops the change of a single stat in its compact size", () => {
    show("stat", "S", BUCKETS, "none");
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.queryByText("3 more than the previous period")).not.toBeInTheDocument();
  });

  it.each([
    ["S", 1],
    ["M", 3],
    ["L", 4],
  ] as const)("shows %s stats side by side", (size, count) => {
    show("stats", size, BUCKETS, "none");
    expect(screen.getAllByRole("term")).toHaveLength(count);
  });

  it.each([
    ["S", 3],
    ["M", 6],
    ["L", 10],
  ] as const)("shows %s feed headlines", (size, count) => {
    show("feed", size, TRACKS);
    expect(screen.getAllByRole("listitem")).toHaveLength(count);
  });

  it.each([
    ["S", 4],
    ["M", 6],
    ["L", 10],
  ] as const)("dates %s calendar entries by their release day", (size, count) => {
    show("calendar", size, ALBUMS);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(count);
    expect(within(rows[0]).getByText("17")).toBeInTheDocument();
    expect(within(rows[0]).getByText("May")).toBeInTheDocument();
  });

  it("dates a feed release and leaves it without actions when it has no catalog id", () => {
    show("calendar", "M", createFeedAlbumResult([createFeedAlbumRow()]), "request");
    expect(screen.getByText("Nov")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request Fresh One" })).not.toBeInTheDocument();
  });

  it("says when a view is not built yet instead of drawing it", () => {
    show("heatmap", "M", TRACKS);
    expect(screen.getByText("This view arrives in a later update.")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("says which integration a feed is waiting on", () => {
    show("list", "M", createFeedAlbumResult([], "listenbrainz"));
    expect(screen.getByText("Add your ListenBrainz user in Settings to fill this widget.")).toBeInTheDocument();
  });

  it("shows a deleted widget as a note once the list has loaded", () => {
    renderWithProviders(<CustomWidget widget={null} status="ready" size="M" />);
    expect(screen.getByRole("heading", { level: 3, name: "Deleted widget" })).toBeInTheDocument();
    expect(
      screen.getByText("This widget no longer exists. Remove it from the board with Customize.")
    ).toBeInTheDocument();
    expect(dataQuery).not.toHaveBeenCalled();
  });

  it("never calls a widget deleted when the list failed to load", () => {
    renderWithProviders(<CustomWidget widget={null} status="error" size="M" />);
    expect(screen.getByText("Couldn't load this right now.")).toBeInTheDocument();
    expect(screen.queryByText("Deleted widget")).not.toBeInTheDocument();
    expect(screen.queryByText(/no longer exists/)).not.toBeInTheDocument();
  });

  it("shows no deleted title while the list is still loading", () => {
    renderWithProviders(<CustomWidget widget={null} status="loading" size="M" />);
    expect(screen.queryByText("Deleted widget")).not.toBeInTheDocument();
    expect(screen.queryByText(/no longer exists/)).not.toBeInTheDocument();
  });
});
