import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithProviders, screen, fireEvent, act } from "@test/test-utils";
import type { MusicTrack } from "@api/__generated__/types";
import { createMockQuery, createLoadingQuery, createErrorQuery } from "@test/mocks";
import { TrendingHero } from "../TrendingHero";
import { createTrendingItem } from "./fixtures";

interface TrendingPayload {
  data: { tracks: { track: MusicTrack; addedAt: string }[] };
}

const useTrendingTracksMock = vi.fn();

vi.mock("@hooks/api/queries/useTrendingTracks", () => ({
  useTrendingTracks: () => useTrendingTracksMock(),
}));

vi.mock("../TrendingHeroSlide", () => ({
  TrendingHeroSlide: ({ item, total }: { item: { track: MusicTrack }; total: number }) => (
    <div data-testid="slide" data-total={total}>
      {item.track.title}
    </div>
  ),
}));

vi.mock("../TrendingHeroNav", () => ({
  TrendingHeroNav: ({ total, onNext, onPrev }: { total: number; onNext: () => void; onPrev: () => void }) => (
    <div data-testid="nav" data-total={total}>
      <button type="button" onClick={onPrev}>
        nav-prev
      </button>
      <button type="button" onClick={onNext}>
        nav-next
      </button>
    </div>
  ),
}));

function buildPayload(count: number): TrendingPayload {
  return {
    data: {
      tracks: Array.from({ length: count }).map((_, i) =>
        createTrendingItem({ id: `track-${i}`, title: `Track ${i}` })
      ),
    },
  };
}

describe("TrendingHero", () => {
  afterEach(() => {
    vi.clearAllMocks();
    useTrendingTracksMock.mockReset();
  });

  it("renders the skeleton while loading", () => {
    useTrendingTracksMock.mockReturnValue(createLoadingQuery<TrendingPayload>());

    const { container } = renderWithProviders(<TrendingHero />);

    expect(container.querySelector(".bg-fg\\/10")).toBeInTheDocument();
    expect(screen.queryByTestId("slide")).not.toBeInTheDocument();
  });

  it("renders the skeleton when the track list is empty", () => {
    useTrendingTracksMock.mockReturnValue(createMockQuery<TrendingPayload>(buildPayload(0)));

    renderWithProviders(<TrendingHero />);

    expect(screen.queryByTestId("slide")).not.toBeInTheDocument();
  });

  it("renders the error empty state when the query errors", () => {
    useTrendingTracksMock.mockReturnValue(createErrorQuery<TrendingPayload>(new Error("boom")));

    renderWithProviders(<TrendingHero />);

    expect(screen.getByText("Failed to load trending tracks")).toBeInTheDocument();
  });

  it("renders the active slide and nav with the full track total", () => {
    useTrendingTracksMock.mockReturnValue(createMockQuery<TrendingPayload>(buildPayload(3)));

    renderWithProviders(<TrendingHero />);

    expect(screen.getByTestId("slide")).toHaveTextContent("Track 0");
    expect(screen.getByTestId("nav")).toHaveAttribute("data-total", "3");
  });

  it("advances to the next track when nav next is clicked", () => {
    useTrendingTracksMock.mockReturnValue(createMockQuery<TrendingPayload>(buildPayload(3)));

    renderWithProviders(<TrendingHero />);
    fireEvent.click(screen.getByText("nav-next"));

    expect(screen.getByTestId("slide")).toHaveTextContent("Track 1");
  });

  it("wraps to the last track when nav prev is clicked from the first", () => {
    useTrendingTracksMock.mockReturnValue(createMockQuery<TrendingPayload>(buildPayload(3)));

    renderWithProviders(<TrendingHero />);
    fireEvent.click(screen.getByText("nav-prev"));

    expect(screen.getByTestId("slide")).toHaveTextContent("Track 2");
  });

  it("moves to the previous slide on the ArrowLeft key", () => {
    useTrendingTracksMock.mockReturnValue(createMockQuery<TrendingPayload>(buildPayload(3)));

    renderWithProviders(<TrendingHero />);
    fireEvent.keyDown(screen.getByRole("region", { name: "Trending tracks hero" }), { key: "ArrowLeft" });

    expect(screen.getByTestId("slide")).toHaveTextContent("Track 2");
  });

  it("moves to the next slide on the ArrowRight key", () => {
    useTrendingTracksMock.mockReturnValue(createMockQuery<TrendingPayload>(buildPayload(3)));

    renderWithProviders(<TrendingHero />);
    fireEvent.keyDown(screen.getByRole("region", { name: "Trending tracks hero" }), { key: "ArrowRight" });

    expect(screen.getByTestId("slide")).toHaveTextContent("Track 1");
  });

  it("auto-rotates to the next track after the interval elapses", () => {
    vi.useFakeTimers();
    try {
      useTrendingTracksMock.mockReturnValue(createMockQuery<TrendingPayload>(buildPayload(3)));

      renderWithProviders(<TrendingHero />);
      expect(screen.getByTestId("slide")).toHaveTextContent("Track 0");

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(screen.getByTestId("slide")).toHaveTextContent("Track 1");
    } finally {
      vi.useRealTimers();
    }
  });

  it("pauses auto-rotation on mouse enter", () => {
    vi.useFakeTimers();
    try {
      useTrendingTracksMock.mockReturnValue(createMockQuery<TrendingPayload>(buildPayload(3)));

      renderWithProviders(<TrendingHero />);
      fireEvent.mouseEnter(screen.getByRole("region", { name: "Trending tracks hero" }));

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(screen.getByTestId("slide")).toHaveTextContent("Track 0");
    } finally {
      vi.useRealTimers();
    }
  });
});
