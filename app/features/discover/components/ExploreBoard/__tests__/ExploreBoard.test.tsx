import { afterEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import type { BoardLayout } from "@hooks/api/queries/board/types";
import { render, screen } from "@test/test-utils";

import { ExploreBoard } from "../ExploreBoard";
import { DEFAULT_BOARD } from "../constants";

interface BoardLayoutResult {
  data: BoardLayout | null | undefined;
  isLoading: boolean;
}

const { useBoardLayoutMock, viewport, stub } = vi.hoisted(() => ({
  useBoardLayoutMock: vi.fn<() => BoardLayoutResult>(),
  viewport: { wide: true },
  stub:
    (name: string) =>
    ({ size, info }: { size: string; info: string }) => <div data-widget={name} data-size={size} data-info={info} />,
}));

vi.mock("@hooks/api/queries/board/useBoardLayout", () => ({
  useBoardLayout: () => useBoardLayoutMock(),
}));

vi.mock("@hooks/ui/useMediaQuery", () => ({
  useMediaQuery: () => viewport.wide,
}));

vi.mock("../../TrendingHero/TrendingHero", () => ({ TrendingHero: stub("trending") }));
vi.mock("../../DiscoveryMixes/DiscoveryMixes", () => ({ DiscoveryMixes: stub("mixes") }));
vi.mock("../../ArtistSpotlight/ArtistSpotlight", () => ({ ArtistSpotlight: stub("artistsNext") }));
vi.mock("../../CategoriesGrid/CategoriesGrid", () => ({ CategoriesGrid: stub("genres") }));
vi.mock("../../TopTracks/TopTracks", () => ({ TopTracks: stub("topTracks") }));
vi.mock("../../RecentScrobbles/RecentScrobbles", () => ({ RecentScrobbles: stub("scrobbles") }));
vi.mock("../../RecentRequests/RecentRequests", () => ({ RecentRequests: stub("requests") }));

function renderedTileIds(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-board-tile]")).map(
    (tile) => tile.dataset.boardTile ?? ""
  );
}

describe("ExploreBoard", () => {
  afterEach(() => {
    useBoardLayoutMock.mockReset();
    viewport.wide = true;
  });

  it("shows the section loader while the saved layout loads", () => {
    useBoardLayoutMock.mockReturnValue({ data: undefined, isLoading: true });

    const { container } = render(<ExploreBoard />);

    expect(container.querySelector("[data-board-tile]")).toBeNull();
    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });

  it("renders the default board in order when nothing is saved", () => {
    useBoardLayoutMock.mockReturnValue({ data: null, isLoading: false });

    const { container } = render(<ExploreBoard />);

    expect(screen.getByRole("region", { name: i18n.t("discover:board.regionLabel") })).toBeInTheDocument();
    expect(renderedTileIds(container)).toEqual(DEFAULT_BOARD.map((item) => item.id));
  });

  it("renders only the saved tiles, passing each widget its size and translated description", () => {
    useBoardLayoutMock.mockReturnValue({
      data: {
        schemaVersion: 1,
        items: [
          { id: "b", widget: "requests", size: "M" },
          { id: "a", widget: "scrobbles", size: "M" },
        ],
      },
      isLoading: false,
    });

    const { container } = render(<ExploreBoard />);

    expect(renderedTileIds(container)).toEqual(["b", "a"]);
    const requests = container.querySelector("[data-widget='requests']");
    expect(requests).toHaveAttribute("data-size", "M");
    expect(requests).toHaveAttribute("data-info", i18n.t("discover:board.widgets.requests"));
  });

  it("places the tiles on the grid with their packed column and row spans", () => {
    useBoardLayoutMock.mockReturnValue({
      data: {
        schemaVersion: 1,
        items: [
          { id: "a", widget: "scrobbles", size: "M" },
          { id: "b", widget: "requests", size: "M" },
        ],
      },
      isLoading: false,
    });

    const { container } = render(<ExploreBoard />);

    const second = container.querySelector<HTMLElement>("[data-board-tile='b']");
    expect(second?.style.getPropertyValue("--tile-col")).toBe("7 / span 6");
    expect(second?.style.getPropertyValue("--tile-row")).toBe("1 / span 4");
  });

  it("hands each widget its narrow size on a narrow board", () => {
    viewport.wide = false;
    useBoardLayoutMock.mockReturnValue({
      data: { schemaVersion: 1, items: [{ id: "g", widget: "genres", size: "XL" }] },
      isLoading: false,
    });

    const { container } = render(<ExploreBoard />);

    expect(container.querySelector("[data-widget='genres']")).toHaveAttribute("data-size", "M+");
    expect(container.querySelector<HTMLElement>("[data-board-tile='g']")?.style.getPropertyValue("--tile-col")).toBe(
      "1 / span 4"
    );
  });
});
