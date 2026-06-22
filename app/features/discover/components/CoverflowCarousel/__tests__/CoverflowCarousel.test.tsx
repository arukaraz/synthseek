import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import type { MusicTrack } from "@api/__generated__/types";
import { CoverflowCarousel } from "../CoverflowCarousel";
import type { CoverflowCarouselProps } from "../types";

vi.mock("../CoverflowCard", () => ({
  CoverflowCard: ({ index, isCenter, onClick }: { index: number; isCenter: boolean; onClick: (i: number) => void }) => (
    <div data-testid="coverflow-card" data-index={index} data-center={isCenter} onClick={() => onClick(index)} />
  ),
}));

vi.mock("../CoverflowSkeleton", () => ({
  CoverflowSkeleton: () => <div data-testid="coverflow-skeleton" />,
}));

let widthSpy: ReturnType<typeof vi.spyOn> | null = null;

function stubWidth(width: number) {
  widthSpy = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(width);
}

function createTrack(id: string): MusicTrack {
  return {
    type: "track",
    id,
    title: `Track ${id}`,
    artist: "Artist",
    artists: [{ id: "a", name: "Artist" }],
    album: { id: "alb", name: "Alb", images: [] },
    duration_ms: 1000,
    track_number: 1,
    disc_number: 1,
    isrc: null,
    explicit: false,
    popularity: null,
    preview_url: null,
    images: [],
  };
}

function buildProps(overrides: Partial<CoverflowCarouselProps> = {}): CoverflowCarouselProps {
  return {
    tracks: ["0", "1", "2"].map((id) => ({ track: createTrack(id), addedAt: "2026" })),
    currentIndex: 0,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onIndexChange: vi.fn(),
    setIsAutoPlaying: vi.fn(),
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

describe("CoverflowCarousel", () => {
  beforeEach(() => {
    class StubResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", StubResizeObserver);
  });

  afterEach(() => {
    widthSpy?.mockRestore();
    widthSpy = null;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders the error empty state when isError is true", () => {
    stubWidth(1000);
    render(<CoverflowCarousel {...buildProps({ isError: true })} />);

    expect(screen.getByText("Failed to load trending tracks")).toBeInTheDocument();
  });

  it("renders the skeleton while loading", () => {
    stubWidth(1000);
    render(<CoverflowCarousel {...buildProps({ isLoading: true })} />);

    expect(screen.getByTestId("coverflow-skeleton")).toBeInTheDocument();
  });

  it("renders the skeleton when there are no tracks", () => {
    stubWidth(1000);
    render(<CoverflowCarousel {...buildProps({ tracks: [] })} />);

    expect(screen.getByTestId("coverflow-skeleton")).toBeInTheDocument();
  });

  it("renders the skeleton when the container has zero width", () => {
    stubWidth(0);
    render(<CoverflowCarousel {...buildProps()} />);

    expect(screen.getByTestId("coverflow-skeleton")).toBeInTheDocument();
  });

  it("renders the carousel title, subtitle and cards once measured", () => {
    stubWidth(1000);
    render(<CoverflowCarousel {...buildProps()} />);

    expect(screen.getByText("Random Trending Picks")).toBeInTheDocument();
    expect(screen.getByText("Fresh hits updated daily")).toBeInTheDocument();
    expect(screen.getAllByTestId("coverflow-card")).toHaveLength(3);
  });

  it("marks the card at currentIndex as centered", () => {
    stubWidth(1000);
    render(<CoverflowCarousel {...buildProps({ currentIndex: 1 })} />);

    const cards = screen.getAllByTestId("coverflow-card");
    expect(cards[1]).toHaveAttribute("data-center", "true");
    expect(cards[0]).toHaveAttribute("data-center", "false");
  });

  it("invokes onPrev when the previous arrow is clicked", () => {
    stubWidth(1000);
    const onPrev = vi.fn();
    render(<CoverflowCarousel {...buildProps({ onPrev })} />);

    fireEvent.click(screen.getByRole("button", { name: "Previous track" }));

    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("invokes onNext when the next arrow is clicked", () => {
    stubWidth(1000);
    const onNext = vi.fn();
    render(<CoverflowCarousel {...buildProps({ onNext })} />);

    fireEvent.click(screen.getByRole("button", { name: "Next track" }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onIndexChange when an off-center card is clicked", () => {
    stubWidth(1000);
    const onIndexChange = vi.fn();
    render(<CoverflowCarousel {...buildProps({ currentIndex: 0, onIndexChange })} />);

    fireEvent.click(screen.getAllByTestId("coverflow-card")[2]);

    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it("pauses autoplay on mouse enter and resumes on leave", () => {
    stubWidth(1000);
    const setIsAutoPlaying = vi.fn();
    render(<CoverflowCarousel {...buildProps({ setIsAutoPlaying })} />);

    const region = screen.getByRole("region", { name: "Trending tracks carousel" });
    fireEvent.mouseEnter(region);
    fireEvent.mouseLeave(region);

    expect(setIsAutoPlaying).toHaveBeenNthCalledWith(1, false);
    expect(setIsAutoPlaying).toHaveBeenNthCalledWith(2, true);
  });

  it("calls onPrev on the ArrowLeft key", () => {
    stubWidth(1000);
    const onPrev = vi.fn();
    render(<CoverflowCarousel {...buildProps({ onPrev })} />);

    fireEvent.keyDown(screen.getByRole("region", { name: "Trending tracks carousel" }), { key: "ArrowLeft" });

    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("calls onNext on the ArrowRight key", () => {
    stubWidth(1000);
    const onNext = vi.fn();
    render(<CoverflowCarousel {...buildProps({ onNext })} />);

    fireEvent.keyDown(screen.getByRole("region", { name: "Trending tracks carousel" }), { key: "ArrowRight" });

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("does not render cards beyond the max visible offset", () => {
    stubWidth(1000);
    const tracks = Array.from({ length: 60 }).map((_, i) => ({ track: createTrack(String(i)), addedAt: "2026" }));
    render(<CoverflowCarousel {...buildProps({ tracks, currentIndex: 0 })} />);

    expect(screen.getAllByTestId("coverflow-card").length).toBeLessThan(60);
  });
});
