import { afterEach, describe, expect, it, vi } from "vitest";

import type { BoardSize } from "@hooks/api/queries/board/types";
import type { WidgetBlock, WidgetResult } from "@hooks/api/queries/widgets/types";
import {
  createAlbumResult,
  createBucketResult,
  createDailySeries,
  createFeedAlbumResult,
  createFeedAlbumRow,
  createMatrixResult,
  createQuestionAlbumRow,
  createQuestionTrackRow,
  createSeriesResult,
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
const YEAR = createSeriesResult(
  createDailySeries(
    "2026-01-01",
    Array.from({ length: 365 }, (_, index) => (index + 4) % 8)
  )
);
const WEEKS = createSeriesResult([
  { key: "2026-10-05", value: 10, prev: null },
  { key: "2026-10-12", value: 20, prev: null },
  { key: "2026-10-19", value: 30, prev: null },
  { key: "2026-10-26", value: 42, prev: null },
]);
const MATRIX = createMatrixResult(
  Array.from({ length: 7 * 24 }, (_, index) => {
    const weekday = Math.floor(index / 24);
    const hour = index % 24;
    const busy = new Map([
      ["4:21", 9],
      ["4:8", 2],
      ["0:9", 3],
    ]);
    return { weekday, hour, value: busy.get(`${weekday}:${hour}`) ?? 0 };
  })
);
const MOVES = {
  ...createTrackResult(
    Array.from({ length: 14 }, (_, index) =>
      createQuestionTrackRow({
        id: `m${index}`,
        title: `Mover ${index}`,
        value: index < 3 ? [3, null, -1][index] : 0,
      })
    )
  ),
  measure: "rankDelta" as const,
  previous: { from: new Date("2026-08-30T00:00:00Z"), to: new Date("2026-09-29T00:00:00Z") },
};

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

  it.each([
    ["S", 8],
    ["M", 16],
    ["L", 32],
  ] as const)("draws the latest %s series points as bars with the first and last labels", (size, bars) => {
    show("bars", size, YEAR, "none");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(bars);
    expect(items.at(-1)).toHaveAccessibleName("Dec 31: 0 plays");
  });

  it("labels every bucket bar under it", () => {
    show("bars", "M", BUCKETS, "none");
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("listitem", { name: "Rock: 12 plays" })).toHaveTextContent("Rock");
  });

  it.each(["S", "M", "L"] as const)("draws a sparkline with the latest value in %s", (size) => {
    show("sparkline", size, WEEKS, "none");
    expect(screen.getByRole("img", { name: "Trend, latest Oct 26: 42 plays" })).toBeInTheDocument();
    expect(screen.queryAllByText("Oct 5")).toHaveLength(size === "S" ? 0 : 1);
  });

  it.each(["M", "L"] as const)("draws the weekday and hour heatmap in %s", (size) => {
    show("heatmap", size, MATRIX, "none");
    expect(screen.getByRole("img", { name: "Listening by weekday and hour" })).toBeInTheDocument();
    expect(screen.getByTitle("Fri 21:00, 9")).toBeInTheDocument();
    expect(screen.getByText("Busiest at Fri 21:00")).toBeInTheDocument();
  });

  it("compacts the heatmap to one bar per weekday in S", () => {
    show("heatmap", "S", MATRIX, "none");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const days = screen.getAllByRole("listitem");
    expect(days).toHaveLength(7);
    expect(days[4]).toHaveTextContent("Fri");
    expect(days[4]).toHaveTextContent("11");
  });

  it.each(["S", "M", "L"] as const)("shows the latest value of a trend with its change in %s", (size) => {
    show("statTrend", size, WEEKS, "none");
    expect(screen.getByText("42 plays")).toBeInTheDocument();
    expect(screen.getByText("12 more than the previous period")).toBeInTheDocument();
  });

  it.each([
    ["S", 5],
    ["M", 8],
    ["L", 12],
  ] as const)("ranks %s rows with how far each one moved", (size, rows) => {
    show("rankingMoves", size, MOVES, "none");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(rows);
    expect(items[0]).toHaveTextContent("Up 3");
    expect(items[1]).toHaveTextContent("New");
    expect(items[2]).toHaveTextContent("Down 1");
  });

  it.each([
    ["S", 3],
    ["M", 5],
    ["L", 5],
  ] as const)("compares %s buckets with the previous period", (size, rows) => {
    show("compare", size, BUCKETS, "none");
    expect(screen.getAllByRole("listitem")).toHaveLength(rows);
    expect(screen.getByRole("listitem", { name: "Rock: 12 plays now, 9 plays before" })).toBeInTheDocument();
    expect(screen.getByText("Previous period")).toBeInTheDocument();
  });

  it.each([
    ["S", 4],
    ["M", 10],
    ["L", 20],
  ] as const)("tiles %s covers in a mosaic and plays one from its cover", (size, tiles) => {
    show("mosaic", size, TRACKS);
    expect(screen.getAllByRole("listitem")).toHaveLength(Math.min(tiles, 14));
    fireEvent.click(screen.getByRole("button", { name: "Play Song 1" }));
    expect(playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["req-1"] });
  });

  it.each([
    ["M", 179],
    ["L", 368],
  ] as const)("lays out the latest weeks of daily listening in %s", (size, cells) => {
    show("yearCalendar", size, YEAR, "none");
    const grid = screen.getByRole("img", { name: "1.3K in this year" });
    expect(grid.children).toHaveLength(cells);
    expect(screen.getByTitle("Dec 30: 7 plays")).toBeInTheDocument();
  });

  it("turns the year calendar into a trend in S", () => {
    show("yearCalendar", "S", YEAR, "none");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("0 plays")).toBeInTheDocument();
    expect(screen.getByText("Dec 31")).toBeInTheDocument();
  });

  it.each([
    ["S", 4],
    ["M", 5],
    ["L", 5],
  ] as const)("splits the total into %s shares", (size, rows) => {
    show("share", size, BUCKETS, "none");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(rows);
    expect(items[0]).toHaveTextContent("Rock");
    expect(items[0]).toHaveTextContent("46%");
    expect(items.at(-1)).toHaveTextContent("Other");
  });

  it("says nothing matches when every point of a series is zero", () => {
    show("bars", "M", createSeriesResult([{ key: "2026-10-01", value: 0, prev: null }]), "none");
    expect(screen.getByText("Nothing matches this widget right now.")).toBeInTheDocument();
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
    expect(screen.getByRole("heading", { level: 3, name: "Custom widget" })).toBeInTheDocument();
    expect(screen.queryByText("Deleted widget")).not.toBeInTheDocument();
    expect(screen.queryByText(/no longer exists/)).not.toBeInTheDocument();
  });

  it("names the frame neutrally and never deleted while the list is still loading", () => {
    renderWithProviders(<CustomWidget widget={null} status="loading" size="M" />);
    expect(screen.getByRole("heading", { level: 3, name: "Custom widget" })).toBeInTheDocument();
    expect(screen.queryByText("Deleted widget")).not.toBeInTheDocument();
    expect(screen.queryByText(/no longer exists/)).not.toBeInTheDocument();
  });

  it("leaves the date badge out of a calendar row that has no date", () => {
    show("calendar", "M", createTrackResult([createQuestionTrackRow({ playedAt: null })]));
    const [row] = screen.getAllByRole("listitem");
    expect(row).toHaveTextContent("Song One");
    expect(row).not.toHaveTextContent("?");
  });
});
