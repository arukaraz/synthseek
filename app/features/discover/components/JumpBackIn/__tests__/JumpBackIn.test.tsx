import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { JumpBackIn } from "../JumpBackIn";

const { playEntity, jumpQuery, measured } = vi.hoisted(() => ({
  playEntity: vi.fn(),
  jumpQuery: vi.fn(),
  measured: { width: 0 },
}));

vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity }) }));
vi.mock("@hooks/api/queries/analytics/useJumpBackIn", () => ({ useJumpBackIn: () => jumpQuery() }));
vi.mock("@hooks/ui/useElementWidth", () => ({ useElementWidth: () => [vi.fn(), measured.width] }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

function album(id: string) {
  return {
    albumExternalId: id,
    name: `Album ${id}`,
    artist: "Bjork",
    cover: `${id}.jpg`,
    playedTracks: 3,
    totalTracks: 10,
    lastPlayedAt: new Date("2026-10-17T00:00:00Z"),
  };
}

const NINE = ["a", "b", "c", "d", "e", "f", "g", "h", "i"].map(album);

afterEach(() => {
  vi.clearAllMocks();
  measured.width = 0;
});

describe("JumpBackIn", () => {
  it("shows as many albums as fit at half width, four at most", () => {
    jumpQuery.mockReturnValue({ data: NINE, isLoading: false, isError: false });
    measured.width = 640;
    renderWithProviders(<JumpBackIn size="M" info="x" />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
    expect(screen.getAllByText("3/10 played")).toHaveLength(4);
  });

  it("drops to two albums on a narrow phone, and keeps two before it has been measured", () => {
    jumpQuery.mockReturnValue({ data: NINE, isLoading: false, isError: false });
    measured.width = 360;
    const { unmount } = renderWithProviders(<JumpBackIn size="M" info="x" />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    unmount();

    measured.width = 0;
    renderWithProviders(<JumpBackIn size="L" info="x" />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("fills a full-width row with every album that fits and plays the album chosen", () => {
    jumpQuery.mockReturnValue({ data: NINE, isLoading: false, isError: false });
    measured.width = 1400;
    renderWithProviders(<JumpBackIn size="L" info="x" />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(8);
    fireEvent.click(screen.getByRole("button", { name: "Play Album b" }));
    expect(playEntity).toHaveBeenCalledWith({ kind: "album", albumExternalId: "b" });
  });

  it("keeps a quarter tile to two albums however wide it measures", () => {
    jumpQuery.mockReturnValue({ data: NINE, isLoading: false, isError: false });
    measured.width = 1400;
    renderWithProviders(<JumpBackIn size="S" info="x" />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("explains the empty state and a failed load", () => {
    jumpQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
    const { unmount } = renderWithProviders(<JumpBackIn size="L" info="x" />);
    expect(screen.getByText("Albums you start and leave unfinished show up here.")).toBeInTheDocument();
    unmount();

    jumpQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<JumpBackIn size="L" info="x" />);
    expect(screen.getByText("Couldn't load your listening history.")).toBeInTheDocument();
  });

  it("shows one placeholder per card slot while loading", () => {
    jumpQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    measured.width = 640;
    const { container } = renderWithProviders(<JumpBackIn size="M" info="x" />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
  });
});
