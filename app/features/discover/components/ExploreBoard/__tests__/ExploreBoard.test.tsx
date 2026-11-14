import { afterEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import { TooltipProvider } from "@components/ui/Tooltip";
import type { BoardLayout } from "@hooks/api/queries/board/types";
import { PHONE_QUERY } from "@hooks/ui/constants";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { ExploreBoard } from "../ExploreBoard";
import { DEFAULT_BOARD } from "../constants";

interface BoardLayoutResult {
  data: BoardLayout | null | undefined;
  isLoading: boolean;
}

const { useBoardLayoutMock, saveMock, viewport, myWidgets, stub } = vi.hoisted(() => ({
  useBoardLayoutMock: vi.fn<() => BoardLayoutResult>(),
  saveMock: vi.fn<(layout: BoardLayout) => Promise<boolean>>(() => Promise.resolve(true)),
  viewport: { wide: true },
  myWidgets: { data: [], isLoading: false, isError: false },
  stub:
    (name: string) =>
    ({ size, info }: { size: string; info: string }) => <div data-widget={name} data-size={size} data-info={info} />,
}));

vi.mock("@hooks/api/queries/board/useBoardLayout", () => ({
  useBoardLayout: () => useBoardLayoutMock(),
}));

vi.mock("@hooks/api/queries/widgets/useMyWidgets", () => ({
  useMyWidgets: () => myWidgets,
}));

vi.mock("@hooks/api/mutations/board/useSaveBoardLayout", () => ({
  useSaveBoardLayout: () => saveMock,
}));

vi.mock("@hooks/api/queries/board/useBoardAppearance", () => ({
  useBoardAppearance: () => ({ data: { density: "comfortable", text: "default" } }),
}));
vi.mock("@hooks/api/mutations/board/useSetBoardAppearance", () => ({
  useSetBoardAppearance: () => () => Promise.resolve(true),
}));
vi.mock("@hooks/api/mutations/board/useUndoBoardTemplate", () => ({
  useUndoBoardTemplate: () => ({ mutate: vi.fn() }),
}));
vi.mock("../../NeverInclude/NeverIncludeCard", () => ({
  NeverIncludeCard: () => <section data-testid="never-include" />,
}));
vi.mock("@hooks/api/queries/widgets/useWidgetCatalog", () => ({ useWidgetCatalog: () => ({ data: undefined }) }));
vi.mock("@hooks/api/queries/widgets/useWidgetGrammar", () => ({ useWidgetGrammar: () => ({ data: undefined }) }));
vi.mock("@hooks/api/queries/widgets/useWidgetPresets", () => ({ useWidgetPresets: () => ({ data: [] }) }));
vi.mock("@hooks/api/queries/widgets/useWidgetHousehold", () => ({ useWidgetHousehold: () => ({ data: [] }) }));
vi.mock("@modules/providers/CountryProvider", () => ({ useCountry: () => ({ country: "US" }) }));
vi.mock("@hooks/api/mutations/widgets/useImportWidgetPreview", () => ({
  useImportWidgetPreview: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/ui/useMediaQuery", () => ({
  useMediaQuery: (query: string) => (query === PHONE_QUERY ? !viewport.wide : viewport.wide),
}));

vi.mock("../../TrendingHero/TrendingHero", () => ({ TrendingHero: stub("trending") }));
vi.mock("../../DiscoveryMixes/DiscoveryMixes", () => ({ DiscoveryMixes: stub("mixes") }));
vi.mock("../../ArtistSpotlight/ArtistSpotlight", () => ({ ArtistSpotlight: stub("artistsNext") }));
vi.mock("../../CategoriesGrid/CategoriesGrid", () => ({ CategoriesGrid: stub("genres") }));
vi.mock("../../TopTracks/TopTracks", () => ({ TopTracks: stub("topTracks") }));
vi.mock("../../RecentScrobbles/RecentScrobbles", () => ({ RecentScrobbles: stub("scrobbles") }));
vi.mock("../../RecentRequests/RecentRequests", () => ({ RecentRequests: stub("requests") }));
vi.mock("../../HistoryMixes/OnRepeat", () => ({ OnRepeat: stub("onRepeat") }));
vi.mock("../../HistoryMixes/RepeatRewind", () => ({ RepeatRewind: stub("rewind") }));
vi.mock("../../HistoryMixes/DeepCuts", () => ({ DeepCuts: stub("deepCuts") }));
vi.mock("../../HistoryMixes/ForgottenFavorites", () => ({ ForgottenFavorites: stub("forgottenFavorites") }));
vi.mock("../../JumpBackIn/JumpBackIn", () => ({ JumpBackIn: stub("jumpBackIn") }));
vi.mock("../../LastYear/LastYear", () => ({ LastYear: stub("lastYear") }));
vi.mock("../../Stations/Stations", () => ({ Stations: stub("stations") }));
vi.mock("../../ContinueListening/ContinueListening", () => ({ ContinueListening: stub("continueListening") }));
vi.mock("../../Rarities/Rarities", () => ({ Rarities: stub("rarities") }));
vi.mock("../../Orbit/Orbit", () => ({ Orbit: stub("orbit") }));
vi.mock("../../LibraryLeaderboard", () => ({ LibraryLeaderboard: stub("leaderboard") }));
vi.mock("../../Charts/Charts", () => ({ Charts: stub("charts") }));
vi.mock("../../LovedNotHere/LovedNotHere", () => ({ LovedNotHere: stub("loved") }));
vi.mock("../../NewInLibrary/NewInLibrary", () => ({ NewInLibrary: stub("newInLibrary") }));
vi.mock("../../Gaps/Gaps", () => ({ Gaps: stub("gaps") }));
vi.mock("../../Anniversaries/Anniversaries", () => ({ Anniversaries: stub("anniversaries") }));
vi.mock("../../Landed/Landed", () => ({ Landed: stub("landed") }));
vi.mock("../../ServerPlaylists/ServerPlaylists", () => ({ ServerPlaylists: stub("serverPlaylists") }));

const TWO_TILES: BoardLayout = {
  schemaVersion: 5,
  items: [
    { kind: "builtin", id: "a", widget: "scrobbles", size: "M" },
    { kind: "builtin", id: "b", widget: "requests", size: "M" },
  ],
  mobile: [{ kind: "builtin", id: "g", widget: "genres", size: "S" }],
};

function only(items: BoardLayout["items"]): BoardLayout {
  return { schemaVersion: 5, items, mobile: items };
}

async function openWidgets() {
  fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
  fireEvent.pointerDown(screen.getByRole("button", { name: i18n.t("discover:board.add.action") }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.click(await screen.findByRole("menuitem", { name: i18n.t("widgets:board.widgetsDialog.action") }));
}

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
    myWidgets.isError = false;
  });

  it("tells a load error apart from a deleted widget on a custom tile", () => {
    const custom = only([{ kind: "custom", id: "c", widgetId: "w_1", size: "M" }]);
    useBoardLayoutMock.mockReturnValue({ data: custom, isLoading: false });

    const { unmount } = render(<ExploreBoard />, { wrapper: TooltipProvider });
    expect(screen.getByText("Deleted widget")).toBeInTheDocument();
    unmount();

    myWidgets.isError = true;
    render(<ExploreBoard />, { wrapper: TooltipProvider });
    expect(screen.queryByText("Deleted widget")).not.toBeInTheDocument();
    expect(screen.getByText("Couldn't load this right now.")).toBeInTheDocument();
  });

  it("shows the section loader while the saved layout loads", () => {
    useBoardLayoutMock.mockReturnValue({ data: undefined, isLoading: true });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });

    expect(container.querySelector("[data-board-tile]")).toBeNull();
    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });

  it("renders the default board in order when nothing is saved", () => {
    useBoardLayoutMock.mockReturnValue({ data: null, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });

    expect(screen.getByRole("region", { name: i18n.t("discover:board.regionLabel") })).toBeInTheDocument();
    expect(renderedTileIds(container)).toEqual(DEFAULT_BOARD.map((item) => item.id));
  });

  it("renders only the saved tiles, passing each widget its size and translated description", () => {
    useBoardLayoutMock.mockReturnValue({
      data: { ...TWO_TILES, items: [TWO_TILES.items[1], TWO_TILES.items[0]] },
      isLoading: false,
    });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });

    expect(renderedTileIds(container)).toEqual(["b", "a"]);
    const requests = container.querySelector("[data-widget='requests']");
    expect(requests).toHaveAttribute("data-size", "M");
    expect(requests).toHaveAttribute("data-info", i18n.t("discover:board.widgets.requests"));
  });

  it("places the tiles on the grid with their packed column and row spans", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });

    const second = tile(container, "b");
    expect(second.style.getPropertyValue("--tile-col")).toBe("7 / span 6");
    expect(second.style.getPropertyValue("--tile-row")).toBe("1 / span 4");
  });

  it("shows the mobile arrangement on a narrow board, at the sizes it saved", () => {
    viewport.wide = false;
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });

    expect(renderedTileIds(container)).toEqual(["g"]);
    expect(container.querySelector("[data-widget='genres']")).toHaveAttribute("data-size", "S");
    expect(tile(container, "g").style.getPropertyValue("--tile-col")).toBe("1 / span 2");
  });

  it("saves an edit made on a narrow board to the mobile arrangement alone", () => {
    viewport.wide = false;
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.click(within(tile(container, "g")).getByRole("button", { name: "Large" }));

    expect(saveMock.mock.calls.at(-1)?.[0]).toEqual({
      ...TWO_TILES,
      mobile: [{ kind: "builtin", id: "g", widget: "genres", size: "L" }],
    });
  });

  it("shows no edit controls until Customize is pressed, and hides them again on Done", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });
    expect(screen.queryByRole("button", { name: /^Remove/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));

    expect(screen.getAllByRole("button", { name: /^Remove/ })).toHaveLength(2);
    expect(tile(container, "a")).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("toolbar")).toHaveTextContent(/^AddAppearance$/);

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.done") }));

    expect(screen.queryByRole("button", { name: /^Remove/ })).not.toBeInTheDocument();
  });

  it("leaves edit mode on Escape", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    render(<ExploreBoard />, { wrapper: TooltipProvider });
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(screen.queryByRole("button", { name: i18n.t("discover:board.done") })).not.toBeInTheDocument();
  });

  it("saves the whole reordered list when a tile moves with the keyboard and announces it", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.keyDown(tile(container, "b"), { key: "ArrowLeft" });

    expect(savedIds()).toEqual(["b", "a"]);
    expect(screen.getByText(/moved to position 1 of 2/)).toBeInTheDocument();
  });

  it("saves a new size picked from the size chips", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.click(within(tile(container, "a")).getByRole("button", { name: "Large" }));

    expect(saveMock.mock.calls.at(-1)?.[0].items[0]).toEqual({
      kind: "builtin",
      id: "a",
      widget: "scrobbles",
      size: "L",
    });
  });

  it("frames each row only in edit mode, opening a head track above it without changing a tile's rows", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });
    expect(screen.queryByRole("group", { name: "Height of row 1" })).toBeNull();
    expect(tile(container, "b").style.getPropertyValue("--tile-row")).toBe("1 / span 4");

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));

    expect(screen.getByRole("group", { name: "Height of row 1" })).toBeInTheDocument();
    expect(tile(container, "b").style.getPropertyValue("--tile-row")).toBe("2 / span 4");
    expect(tile(container, "b").parentElement?.style.getPropertyValue("--board-template-rows")).toBe(
      "2rem repeat(4, var(--board-row))"
    );

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.done") }));

    expect(screen.queryByRole("group", { name: "Height of row 1" })).toBeNull();
    expect(tile(container, "b").style.getPropertyValue("--tile-row")).toBe("1 / span 4");
  });

  it("saves the height picked on a row's frame on every tile of that row", () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    render(<ExploreBoard />, { wrapper: TooltipProvider });
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    fireEvent.click(
      within(screen.getByRole("group", { name: "Height of row 1" })).getByRole("button", { name: "Short" })
    );

    expect(saveMock.mock.calls.at(-1)?.[0].items.map((item) => [item.id, item.height])).toEqual([
      ["a", "short"],
      ["b", "short"],
    ]);
    expect(screen.getByText("Row 1 is now Short")).toBeInTheDocument();
  });

  it("draws a row at the height its tiles carry", () => {
    const tall = only([{ kind: "builtin", id: "a", widget: "scrobbles", size: "M", height: "tall" }]);
    useBoardLayoutMock.mockReturnValue({ data: tall, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });

    expect(tile(container, "a").style.getPropertyValue("--tile-row")).toBe("1 / span 6");
  });

  it("offers an empty state that opens the Widgets dialog when every tile is gone", () => {
    useBoardLayoutMock.mockReturnValue({ data: only([]), isLoading: false });

    render(<ExploreBoard />, { wrapper: TooltipProvider });
    expect(screen.getByText(i18n.t("discover:board.empty.title"))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.addWidget") }));

    expect(screen.getByRole("dialog", { name: i18n.t("widgets:board.widgetsDialog.title") })).toBeInTheDocument();
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Add Discover Mixes" })).toBeInTheDocument();
  });

  it("adds a widget to the layout picked at the end of that arrangement, only once the member saves", async () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    render(<ExploreBoard />, { wrapper: TooltipProvider });
    await openWidgets();
    const dialog = screen.getByRole("dialog");
    fireEvent.pointerDown(within(dialog).getByRole("button", { name: "Add Discover Mixes" }), {
      button: 0,
      pointerType: "mouse",
    });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Desktop" }));
    expect(saveMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.arrange.save") }));

    expect(savedIds()).toEqual(["a", "b", "mixes"]);
    expect(saveMock.mock.calls.at(-1)?.[0].mobile).toEqual(TWO_TILES.mobile);
  });

  it("keeps the edit menu on an empty board, so widgets can still be added and the board settings reached", async () => {
    useBoardLayoutMock.mockReturnValue({ data: only([]), isLoading: false });

    render(<ExploreBoard />, { wrapper: TooltipProvider });
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));

    expect(screen.getByRole("link", { name: i18n.t("widgets:board.appearance.title") })).toHaveAttribute(
      "href",
      "/settings/appearance/board"
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: i18n.t("discover:board.add.action") }), {
      button: 0,
      ctrlKey: false,
    });
    fireEvent.click(await screen.findByRole("menuitem", { name: i18n.t("widgets:board.widgetsDialog.action") }));
    expect(screen.getByRole("dialog", { name: i18n.t("widgets:board.widgetsDialog.title") })).toBeInTheDocument();
  });

  async function openTileSettings(element: HTMLElement) {
    fireEvent.pointerDown(within(element).getByRole("button", { name: /^Settings for/ }), {
      button: 0,
      ctrlKey: false,
    });
    await screen.findByRole("menu");
  }

  it("sends a tile to the bottom of the board and saves the whole list", async () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    await openTileSettings(tile(container, "a"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Move to bottom" }));

    expect(savedIds()).toEqual(["b", "a"]);
  });

  it("saves a tile without its background when it is switched off", async () => {
    useBoardLayoutMock.mockReturnValue({ data: TWO_TILES, isLoading: false });

    const { container } = render(<ExploreBoard />, { wrapper: TooltipProvider });
    fireEvent.click(screen.getByRole("button", { name: i18n.t("discover:board.customize") }));
    await openTileSettings(tile(container, "a"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Hide background" }));

    expect(saveMock.mock.calls.at(-1)?.[0].items[0]).toMatchObject({ id: "a", background: false });
  });
});
