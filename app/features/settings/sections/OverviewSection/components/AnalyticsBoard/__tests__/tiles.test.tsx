import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen, within } from "@test/test-utils";

import { AddedTile } from "../AddedTile";
import { DecadesTile } from "../DecadesTile";
import { DownloadsTile } from "../DownloadsTile";
import { GrowthTile } from "../GrowthTile";
import { ListeningClockTile } from "../ListeningClockTile";
import { ListeningTimeTile } from "../ListeningTimeTile";
import { PlaysTile } from "../PlaysTile";
import { QualityTile } from "../QualityTile";
import { ScrobblesTile } from "../ScrobblesTile";

const queries = vi.hoisted(() => ({
  summary: vi.fn(),
  clock: vi.fn(),
  growth: vi.fn(),
  quality: vi.fn(),
  decades: vi.fn(),
  downloads: vi.fn(),
  scrobbles: vi.fn(),
}));

vi.mock("@hooks/api/queries/analytics/useListeningSummary", () => ({ useListeningSummary: () => queries.summary() }));
vi.mock("@hooks/api/queries/analytics/useListeningClock", () => ({
  useListeningClock: (period: string, timeZone: string) => queries.clock(period, timeZone),
}));
vi.mock("@hooks/api/queries/analytics/useLibraryGrowth", () => ({ useLibraryGrowth: () => queries.growth() }));
vi.mock("@hooks/api/queries/analytics/useQualityMix", () => ({ useQualityMix: () => queries.quality() }));
vi.mock("@hooks/api/queries/analytics/useDecades", () => ({ useDecades: () => queries.decades() }));
vi.mock("@hooks/api/queries/analytics/useDownloadOutcomes", () => ({
  useDownloadOutcomes: () => queries.downloads(),
}));
vi.mock("@hooks/api/queries/analytics/useScrobbleHealth", () => ({ useScrobbleHealth: () => queries.scrobbles() }));

function ready<T>(data: T) {
  return { data, isLoading: false, isError: false };
}

const LOADING = { data: undefined, isLoading: true, isError: false };
const FAILED = { data: undefined, isLoading: false, isError: true };

const SUMMARY = {
  playsByDay: [1, 1, 1, 1, 1, 1, 4, 2, 2, 2, 2, 2, 2, 2],
  minutesByDay: [0, 0, 0, 0, 0, 0, 100, 30, 30, 30, 30, 0, 0, 5],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("PlaysTile and ListeningTimeTile", () => {
  it("sum the last 7 days of the summary and compare them with the 7 before", () => {
    queries.summary.mockReturnValue(ready(SUMMARY));
    renderWithProviders(
      <>
        <PlaysTile />
        <ListeningTimeTile />
      </>
    );

    const plays = screen.getByRole("region", { name: "Plays" });
    expect(within(plays).getByText("14")).toBeInTheDocument();
    expect(within(plays).getByText("+40%")).toBeInTheDocument();
    const time = screen.getByRole("region", { name: "Listening time" });
    expect(within(time).getByText("2h 05m")).toBeInTheDocument();
    expect(within(time).getByText("+25%")).toBeInTheDocument();
  });

  it("show a skeleton while loading and a note when the summary fails", () => {
    queries.summary.mockReturnValueOnce(LOADING).mockReturnValueOnce(FAILED);
    renderWithProviders(
      <>
        <PlaysTile />
        <ListeningTimeTile />
      </>
    );

    expect(within(screen.getByRole("region", { name: "Plays" })).queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Listening time" })).toHaveTextContent("This could not be loaded.");
  });
});

describe("AddedTile and GrowthTile", () => {
  it("compare the last 30 days and chart the weekly additions", () => {
    queries.growth.mockReturnValue(ready({ addedByWeek: [0, 2, 3], addedLast30: 1, addedPrev30: 4 }));
    renderWithProviders(
      <>
        <AddedTile />
        <GrowthTile />
      </>
    );

    const added = screen.getByRole("region", { name: "Added" });
    expect(added).toHaveTextContent("1track");
    expect(within(added).getByText("-75%")).toBeInTheDocument();
    const growth = screen.getByRole("region", { name: "Library growth" });
    expect(growth).toHaveTextContent("5 tracks in 3 weeks");
    expect(growth).toHaveTextContent("3 weeks ago");
  });

  it("explain an empty stretch instead of drawing a flat chart", () => {
    queries.growth.mockReturnValue(ready({ addedByWeek: [0, 0], addedLast30: 0, addedPrev30: 0 }));
    renderWithProviders(<GrowthTile />);

    expect(screen.getByText("Nothing added recently.")).toBeInTheDocument();
  });
});

describe("DownloadsTile", () => {
  it("shows the landed share, the split and the median time", () => {
    queries.downloads.mockReturnValue(ready({ completed: 3, failed: 1, medianMinutes: 90 }));
    renderWithProviders(<DownloadsTile />);

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "3 landed, 1 failed" })).toBeInTheDocument();
    expect(screen.getByText("Median 1h")).toBeInTheDocument();
  });

  it("leaves out the median it does not have", () => {
    queries.downloads.mockReturnValue(ready({ completed: 0, failed: 2, medianMinutes: null }));
    renderWithProviders(<DownloadsTile />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.queryByText(/Median/)).not.toBeInTheDocument();
  });

  it("says so when nothing finished in the window", () => {
    queries.downloads.mockReturnValue(ready({ completed: 0, failed: 0, medianMinutes: null }));
    renderWithProviders(<DownloadsTile />);

    expect(screen.getByText("No downloads in the last 30 days.")).toBeInTheDocument();
  });
});

describe("DecadesTile", () => {
  it("labels each decade and marks the biggest one", () => {
    queries.decades.mockReturnValue(
      ready([
        { decade: 1990, albums: 2 },
        { decade: 2000, albums: 6 },
      ])
    );
    renderWithProviders(<DecadesTile />);

    expect(screen.getByText("1990s")).toBeInTheDocument();
    expect(screen.getByText("2000s")).toBeInTheDocument();
    expect(screen.getByText("6").nextElementSibling).toHaveClass("bg-primary-400");
    expect(screen.getByText("2").nextElementSibling).toHaveClass("bg-primary-400/45");
  });

  it("explains a library without release years", () => {
    queries.decades.mockReturnValue(ready([]));
    renderWithProviders(<DecadesTile />);

    expect(screen.getByText("No release years yet.")).toBeInTheDocument();
  });
});

describe("QualityTile", () => {
  it("lists formats with their share and count", () => {
    queries.quality.mockReturnValue(
      ready({
        formats: [
          { format: "flac", count: 3 },
          { format: "mp3", count: 1 },
        ],
        total: 4,
      })
    );
    renderWithProviders(<QualityTile />);

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("flac75%3");
    expect(rows[1]).toHaveTextContent("mp325%1");
  });

  it("explains an empty library", () => {
    queries.quality.mockReturnValue(ready({ formats: [], total: 0 }));
    renderWithProviders(<QualityTile />);

    expect(screen.getByText("No tracks in the library yet.")).toBeInTheDocument();
  });
});

describe("ScrobblesTile", () => {
  it("totals what was sent and lists only the services that sent something", () => {
    queries.scrobbles.mockReturnValue(
      ready([
        { service: "lastfm", sent: 9, pending: 2, failed: 1 },
        { service: "listenbrainz", sent: 0, pending: 0, failed: 0 },
      ])
    );
    renderWithProviders(<ScrobblesTile />);

    expect(screen.getByText("9")).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Last.fm");
    expect(rows[0]).toHaveTextContent("9 sent");
    expect(rows[0]).toHaveTextContent("2 waiting");
    expect(rows[0]).toHaveTextContent("1 failed");
  });

  it("hides the waiting and failed counts when there are none", () => {
    queries.scrobbles.mockReturnValue(ready([{ service: "listenbrainz", sent: 1, pending: 0, failed: 0 }]));
    renderWithProviders(<ScrobblesTile />);

    expect(screen.getByRole("listitem").textContent).toBe("ListenBrainz1 sent");
  });

  it("explains a quiet month", () => {
    queries.scrobbles.mockReturnValue(ready([{ service: "lastfm", sent: 0, pending: 0, failed: 0 }]));
    renderWithProviders(<ScrobblesTile />);

    expect(screen.getByText("Nothing sent in the last 30 days.")).toBeInTheDocument();
  });
});

describe("ListeningClockTile", () => {
  const cells = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => (day === 4 && hour === 21 ? 3 : 0))
  );

  it("asks for 30 days in the browser's time zone and names the busiest hour", () => {
    queries.clock.mockReturnValue(ready({ cells, total: 3 }));
    renderWithProviders(<ListeningClockTile />);

    expect(queries.clock).toHaveBeenCalledWith("1month", Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(screen.getByText("Busiest at Fri 21:00, 3 plays in all")).toBeInTheDocument();
    expect(screen.getByTitle("Fri 21:00, 3 plays")).toBeInTheDocument();
  });

  it("switches the period from the tabs", () => {
    queries.clock.mockReturnValue(ready({ cells, total: 3 }));
    renderWithProviders(<ListeningClockTile />);

    fireEvent.click(screen.getByRole("tab", { name: "90 days" }));

    expect(queries.clock).toHaveBeenLastCalledWith("3month", expect.any(String));
  });

  it("keeps the period tabs when the period has no plays", () => {
    queries.clock.mockReturnValue(ready({ cells: cells.map((row) => row.map(() => 0)), total: 0 }));
    renderWithProviders(<ListeningClockTile />);

    expect(screen.getByText("No plays in this period.")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "7 days" })).toBeInTheDocument();
  });
});
