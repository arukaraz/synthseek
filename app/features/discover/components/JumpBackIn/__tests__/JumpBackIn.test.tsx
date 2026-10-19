import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { JumpBackIn } from "../JumpBackIn";

const { playEntity, jumpQuery } = vi.hoisted(() => ({ playEntity: vi.fn(), jumpQuery: vi.fn() }));

vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity }) }));
vi.mock("@hooks/api/queries/analytics/useJumpBackIn", () => ({ useJumpBackIn: () => jumpQuery() }));
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

afterEach(() => {
  vi.clearAllMocks();
});

describe("JumpBackIn", () => {
  it("lists the unfinished albums with how far you got, two at half width", () => {
    jumpQuery.mockReturnValue({ data: ["a", "b", "c"].map(album), isLoading: false, isError: false });
    renderWithProviders(<JumpBackIn size="M" info="x" />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    expect(screen.getAllByText("3/10 played")).toHaveLength(2);
  });

  it("shows up to four albums at full width and plays the album chosen", () => {
    jumpQuery.mockReturnValue({ data: ["a", "b", "c", "d", "e"].map(album), isLoading: false, isError: false });
    renderWithProviders(<JumpBackIn size="L" info="x" />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Play Album b" }));
    expect(playEntity).toHaveBeenCalledWith({ kind: "album", albumExternalId: "b" });
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
    const { container } = renderWithProviders(<JumpBackIn size="M" info="x" />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(2);
  });
});
