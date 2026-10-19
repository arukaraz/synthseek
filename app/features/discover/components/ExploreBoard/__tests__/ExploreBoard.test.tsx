import { afterEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import type { BoardLayout } from "@hooks/api/queries/board/types";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { ExploreBoard } from "../ExploreBoard";
import { DEFAULT_BOARD } from "../constants";

interface BoardLayoutResult {
  data: BoardLayout | null | undefined;
  isLoading: boolean;
}

const { useBoardLayoutMock, saveMock, viewport, stub } = vi.hoisted(() => ({
  useBoardLayoutMock: vi.fn<() => BoardLayoutResult>(),
  saveMock: vi.fn<(layout: BoardLayout) => void>(),
  viewport: { wide: true },
  stub:
    (name: string) =>
    ({ size, info }: { size: string; info: string }) => <div data-widget={name} data-size={size} data-info={info} />,
}));

vi.mock("@hooks/api/queries/board/useBoardLayout", () => ({
  useBoardLayout: () => useBoardLayoutMock(),
}));

vi.mock("@hooks/api/mutations/board/useSaveBoardLayout", () => ({
  useSaveBoardLayout: () => saveMock,
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

const TWO_TILES: BoardLayout = {
  schemaVersion: 1,
  items: [
    { id: "a", widget: "scrobbles", size: "M" },
    { id: "b", widget: "requests", size: "M" },
  ],
};

function renderedTileIds(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-board-tile]")).map(
    (tile) => tile.dataset.boardTile ?? ""
  );
}

function tile(container: HTMLElement, id: string): HTMLElement {
  const element = container.querySelector(`[data-board-tile="${id}"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`tile ${id} missing`);
  return element;
}

function savedIds(): string[] {
  return saveMock.mock.calls.at(-1)?.[0].items.map((item) => item.id) ?? [];
}

describe("ExploreBoard", () => {
  afterEach(() => {
    useBoardLayoutMock.mockReset();
    saveMock.mockReset();
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
      data: { schemaVersion: 1, items: [TWO_TILES.items[1], TWO_TILES.items[0]] },
      isLoading: false,
    });

    const { container } = render(<ExploreBoard />);

    expect(renderedTileIds(container)).toEqual(["b", "a"]);
    const requests = container.querySelector("[data-widget='requests']");
    expect(requests).toHaveAttribute("data-size", "M");
    expect(requests).toHaveAttribute("data-info", i18n.t("discover:board.widgets.requests"));
  });

  it("places the tiles on the grid with their packed column and row spans", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />);

    const second = tile(container, "b");
    expect(second.style.getPropertyValue("--tile-col")).toBe("7 / span 6");
    expect(second.style.getPropertyValue("--tile-row")).toBe("1 / span 4");
  });

  it("hands each widget its narrow size on a narrow board", () => {
    viewport.wide = false;
    useBoardLayoutMock.mockReturnValue({
      data: { schemaVersion: 1, items: [{ id: "g", widget: "genres", size: "XL" }] },
      isLoading: false,
    });

    const { container } = render(<ExploreBoard />);

    expect(container.querySelector("[data-widget='genres']")).toHaveAttribute("data-size", "M+");
    expect(tile(container, "g").style.getPropertyValue("--tile-col")).toBe("1 / span 4");
  });

  it("shows no edit controls until Customize is pressed, and hides them again on Done", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />);
    expect(screen.queryByRole("button", { name: /^Remove/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));

    expect(screen.getAllByRole("button", { name: /^Remove/ })).toHaveLength(2);
    expect(tile(container, "a")).toHaveAttribute("tabindex", "0");
    expect(screen.getByText(i18n.t("discover:board.editHint"))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.done") }));

    expect(screen.queryByRole("button", { name: /^Remove/ })).not.toBeInTheDocument();
  });

  it("leaves edit mode on Escape", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    render(<ExploreBoard />);
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(screen.queryByRole("button", { name: i18n.t("discover:board.done") })).not.toBeInTheDocument();
  });

  it("saves the whole reordered list when a tile moves with the keyboard and announces it", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />);
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.keyDown(tile(container, "b"), { key: "ArrowLeft" });

    expect(savedIds()).toEqual(["b", "a"]);
    expect(screen.getByText(/moved to position 1 of 2/)).toBeInTheDocument();
  });

  it("saves a new size picked from the size chips", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />);
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.click(within(tile(container, "a")).getByRole("button", { name: "Large" }));

    expect(saveMock.mock.calls.at(-1)?.[0].items[0]).toEqual({ id: "a", widget: "scrobbles", size: "L" });
  });

  it("offers an empty state that opens the widget gallery when every tile is gone", () => {
    useBoardLayoutMock.mockReturnValue({ data: { schemaVersion: 1, items: [] }, isLoading: false });

    render(<ExploreBoard />);
    expect(screen.getByText(i18n.t("discover:board.empty.title"))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.addWidget") }));

    expect(screen.getByRole("dialog", { name: i18n.t("discover:board.gallery.title") })).toBeInTheDocument();
  });

  it("adds a widget from the gallery at the end of the board", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    render(<ExploreBoard />);
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.addWidget") }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /^Add Discover Mixes/i }));

    expect(savedIds()).toEqual(["a", "b", "mixes"]);
  });
});
