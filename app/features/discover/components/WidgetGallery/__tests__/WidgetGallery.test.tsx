import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import type { BoardItem, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";
import { createWidget, createWidgetCatalog, createWidgetGrammar, createWidgetPreset } from "@test/factories";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { WidgetGallery } from "../WidgetGallery";

const { stub, viewport } = vi.hoisted(() => ({
  stub:
    (name: string) =>
    ({ size }: { size: string }) => <div data-preview={name} data-size={size} />,
  viewport: { wide: true },
}));

vi.mock("@hooks/ui/useMediaQuery", () => ({ useMediaQuery: () => viewport.wide }));
vi.mock("../../BoardSettings/BoardSettingsPanel", () => ({
  BoardSettingsPanel: ({ onApplied }: { onApplied: (applied: string) => void }) => (
    <button type="button" onClick={() => onApplied("applied-board")}>
      apply-stub
    </button>
  ),
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
vi.mock("../../Charts/Charts", () => ({ Charts: stub("charts") }));
vi.mock("../../LovedNotHere/LovedNotHere", () => ({ LovedNotHere: stub("loved") }));
vi.mock("../../NewInLibrary/NewInLibrary", () => ({ NewInLibrary: stub("newInLibrary") }));
vi.mock("../../Gaps/Gaps", () => ({ Gaps: stub("gaps") }));
vi.mock("../../Anniversaries/Anniversaries", () => ({ Anniversaries: stub("anniversaries") }));
vi.mock("../../Landed/Landed", () => ({ Landed: stub("landed") }));
vi.mock("../../ServerPlaylists/ServerPlaylists", () => ({ ServerPlaylists: stub("serverPlaylists") }));
vi.mock("../../LibraryLeaderboard", () => ({ LibraryLeaderboard: stub("leaderboard") }));

const { saveWidget, savePlaylist, removeWidget, myWidgets } = vi.hoisted(() => ({
  saveWidget: vi.fn(),
  savePlaylist: vi.fn(),
  removeWidget: vi.fn(),
  myWidgets: { data: new Array<WidgetDocument>() },
}));

vi.mock("@hooks/api/queries/widgets/useMyWidgets", () => ({ useMyWidgets: () => myWidgets }));
vi.mock("@modules/providers/CountryProvider", () => ({ useCountry: () => ({ country: "MX" }) }));
vi.mock("@hooks/api/queries/widgets/useWidgetCatalog", () => ({
  useWidgetCatalog: () => ({ data: createWidgetCatalog() }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetGrammar", () => ({
  useWidgetGrammar: () => ({ data: createWidgetGrammar() }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetPresets", () => ({
  useWidgetPresets: () => ({
    data: [
      createWidgetPreset({
        key: "charts",
        builtin: "charts",
        draft: {
          ...createWidgetPreset().draft,
          query: {
            type: "feed",
            source: "lastfm.charts",
            params: { country: "US" },
            pick: { by: "rank", order: "asc", limit: 10, random: null },
          },
        },
      }),
      createWidgetPreset({
        key: "forgottenFavorites",
        builtin: "forgottenFavorites",
        draft: {
          ...createWidgetPreset().draft,
          query: {
            type: "question",
            subject: "tracks",
            measure: "plays",
            time: { mode: "named", value: "all" },
            rules: {
              all: [
                { field: "plays", op: "gte", value: 10 },
                { field: "notPlayedInLast", op: "days", value: 180 },
              ],
            },
            pick: { by: "plays", order: "desc", limit: 8, random: { rotate: "daily" } },
          },
          view: { block: "rail", action: "play" },
        },
      }),
    ],
  }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetPreview", () => ({
  useWidgetPreview: () => ({ data: undefined, isLoading: false, isError: false }),
}));
vi.mock("@hooks/api/mutations/widgets/useSaveWidget", () => ({
  useSaveWidget: () => ({ mutate: saveWidget, isPending: false }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetHousehold", () => ({
  useWidgetHousehold: () => ({ data: [{ id: "u_bo", name: "bo" }] }),
}));
vi.mock("@hooks/api/mutations/widgets/useSaveSmartPlaylist", () => ({
  useSaveSmartPlaylist: () => ({ mutate: savePlaylist, isPending: false }),
}));
vi.mock("@hooks/api/mutations/widgets/useRemoveWidget", () => ({
  useRemoveWidget: () => ({ mutate: removeWidget, isPending: false }),
}));
vi.mock("@hooks/api/mutations/widgets/useImportWidgetPreview", () => ({
  useImportWidgetPreview: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@hooks/ui/useDebounce", () => ({ useDebounce: <T,>(value: T) => value }));
vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity: vi.fn() }) }));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: vi.fn(), requestResult: vi.fn() }),
}));

const ON_BOARD: BoardItem[] = [
  { kind: "builtin", id: "s1", widget: "scrobbles", size: "M" },
  { kind: "custom", id: "w_1", widgetId: "w_1", size: "M" },
];

function renderGallery(items: BoardItem[] = ON_BOARD, customize: BoardWidgetKey | null = null) {
  const handlers = {
    onAdd: vi.fn(),
    onAddCustom: vi.fn(),
    onRemove: vi.fn(),
    onTemplateApplied: vi.fn(),
    onClose: vi.fn(),
  };
  render(<WidgetGallery items={items} customize={customize} {...handlers} />);
  return handlers;
}

function openMine() {
  fireEvent.click(screen.getByRole("tab", { name: "My widgets" }));
}

function cardTitles(): string[] {
  return within(screen.getByRole("dialog"))
    .getAllByRole("heading", { level: 4 })
    .map((heading) => heading.textContent ?? "");
}

afterEach(() => {
  viewport.wide = true;
  myWidgets.data = [];
  vi.clearAllMocks();
});

describe("WidgetGallery", () => {
  it("lists every widget in the suggested order with a scaled live preview at the default size", () => {
    renderGallery();

    expect(cardTitles()).toHaveLength(25);
    expect(cardTitles().slice(0, 3)).toEqual(["Trending now", "Continue listening", "Jump back in"]);
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(document.querySelector("[data-preview='mixes']")).toHaveAttribute("data-size", "L");
  });

  it("searches titles and descriptions, and says when nothing matches", () => {
    renderGallery();
    const search = screen.getByRole("searchbox", { name: i18n.t("discover:board.gallery.search") });

    fireEvent.change(search, { target: { value: "listenbrainz" } });
    expect(cardTitles()).toEqual(["Your rarities", "Discover Mixes"]);

    fireEvent.change(search, { target: { value: "zzz" } });
    expect(screen.getByText(i18n.t("discover:board.gallery.empty", { query: "zzz" }))).toBeInTheDocument();
  });

  it("removes a widget already on the board by its tile id and adds one that is not", () => {
    const handlers = renderGallery();

    fireEvent.click(screen.getByRole("button", { name: "Remove Recent Scrobbles" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Trending now" }));

    expect(handlers.onRemove).toHaveBeenCalledWith("s1");
    expect(handlers.onAdd).toHaveBeenCalledWith("trending");
    expect(screen.getAllByText(i18n.t("discover:board.gallery.onBoard"))).toHaveLength(1);
  });

  it("hands an applied template to the board and closes from the Board tab", () => {
    const handlers = renderGallery();

    fireEvent.click(screen.getByRole("tab", { name: "Board" }));
    fireEvent.click(screen.getByRole("button", { name: "apply-stub" }));

    expect(handlers.onTemplateApplied).toHaveBeenCalledWith("applied-board");
    expect(handlers.onClose).toHaveBeenCalled();
  });

  it("closes from its close button", () => {
    const handlers = renderGallery();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it("puts the focus in the search field on a wide screen", () => {
    renderGallery();
    expect(document.activeElement).toBe(screen.getByRole("searchbox"));
  });

  it("leaves the search field unfocused on a phone, where focus would raise the keyboard", () => {
    viewport.wide = false;
    renderGallery();

    expect(document.activeElement).not.toBe(screen.getByRole("searchbox"));
  });

  it("shows my widgets with their board state and ends the grid with the new widget card", () => {
    myWidgets.data = [createWidget(), createWidget({ id: "w_2", meta: { ...createWidget().meta, name: "Deep" } })];
    const handlers = renderGallery();
    openMine();

    const cards = screen.getAllByRole("article");
    expect(cards.map((card) => card.getAttribute("aria-label"))).toEqual(["Most played", "Deep"]);
    expect(within(cards[0]).getByText("On board")).toBeInTheDocument();
    expect(within(cards[0]).getByText("List · Recipe")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add Deep to the board" }));
    expect(handlers.onAddCustom).toHaveBeenCalledWith(expect.objectContaining({ id: "w_2" }));
    expect(screen.getByRole("button", { name: "New widget" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "From JSON" })).toBeInTheDocument();
  });

  it("asks before deleting a widget and names its tiles on the board", () => {
    myWidgets.data = [createWidget()];
    renderGallery();
    openMine();

    fireEvent.click(screen.getByRole("button", { name: "Delete Most played" }));
    expect(
      screen.getByText("The widget is removed from My widgets and from its tile on your board.")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(removeWidget).toHaveBeenCalledWith({ id: "w_1" }, expect.anything());
  });

  it("opens the workshop from the new widget card and starts from a preset with its rules", () => {
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));

    expect(screen.getByText("Show me 10 tracks with the most plays in the last 30 days.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Forgotten favorites" }));

    expect(
      screen.getByText(
        "Show me a daily pick of 8 tracks with the most plays all time, where plays in the window at least 10 and not played in the last 180 days."
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove rule: plays in the window at least 10" }));
    expect(
      screen.getByText(
        "Show me a daily pick of 8 tracks with the most plays all time, where not played in the last 180 days."
      )
    ).toBeInTheDocument();
  });

  it("adds a rule only once it is confirmed", () => {
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));

    fireEvent.click(screen.getByRole("button", { name: "Where" }));
    expect(screen.queryByRole("button", { name: /^Edit rule/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    expect(screen.getByRole("button", { name: "Edit rule: plays in the window at least 5" })).toBeInTheDocument();
    expect(screen.getByText(/where plays in the window at least 5\.$/)).toBeInTheDocument();
  });

  it("leaves a clean workshop without asking and asks before discarding changes", () => {
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "New widget" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Night owl" } });
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Night owl");

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(screen.getByRole("button", { name: "New widget" })).toBeInTheDocument();
  });

  it("saves an edited widget under its own id", () => {
    myWidgets.data = [createWidget()];
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "Edit Most played" }));

    expect(screen.getByRole("heading", { level: 2, name: "Edit Most played" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save widget" }));
    expect(saveWidget).toHaveBeenCalledWith(
      expect.objectContaining({ id: "w_1", meta: expect.objectContaining({ name: "Most played" }) }),
      expect.anything()
    );
  });

  it("customizes a builtin widget into a new widget based on it and goes back to the widget list", () => {
    renderGallery();
    expect(screen.queryByRole("button", { name: "Customize Stations" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Customize Forgotten favorites" }));

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Forgotten favorites (custom)");
    expect(screen.getByText(/daily pick of 8 tracks/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save widget" }));
    expect(saveWidget).toHaveBeenCalledWith(
      expect.objectContaining({ basedOn: "Forgotten favorites", view: { block: "rail", action: "play" } }),
      expect.anything()
    );
    expect(saveWidget.mock.calls[0]?.[0]).not.toHaveProperty("id");

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(cardTitles()).toHaveLength(25);
  });

  it("customizes the charts on the country the member chose", () => {
    renderGallery();
    fireEvent.click(screen.getByRole("button", { name: "Customize Charts" }));
    fireEvent.click(screen.getByRole("button", { name: "Save widget" }));
    expect(saveWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ source: "lastfm.charts", params: { country: "MX" } }),
      }),
      expect.anything()
    );
  });

  it("opens the workshop on the preset when the board asks to customize a tile", () => {
    renderGallery(ON_BOARD, "forgottenFavorites");
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Forgotten favorites (custom)");
  });

  it("turns the recipe into a recap from the subject menu, with the story view, and back", async () => {
    const user = userEvent.setup();
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));

    await user.click(screen.getByRole("button", { name: "Show" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /a recap/ }));
    expect(screen.getByText("Show me a recap of my listening this year.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Measure" })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Story/ })).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("button", { name: "Show" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /^tracks/ }));
    expect(screen.getByText("Show me 10 tracks with the most plays in the last 30 days.")).toBeInTheDocument();
  });

  it("saves the smart playlist first and keeps its id on the widget", () => {
    savePlaylist.mockImplementation((_input, options) => options.onSuccess({ id: "pl_1", name: "Night owl" }));
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Night owl" } });

    fireEvent.click(screen.getByRole("switch", { name: "Also save as a playlist" }));
    fireEvent.click(screen.getByRole("tab", { name: "Daily" }));
    fireEvent.click(screen.getByRole("button", { name: "Save widget" }));

    expect(savePlaylist).toHaveBeenCalledWith(
      expect.objectContaining({
        playlistId: null,
        name: "Night owl",
        refresh: "daily",
        query: expect.objectContaining({ type: "question", subject: "tracks" }),
      }),
      expect.anything()
    );
    expect(saveWidget).toHaveBeenCalledWith(
      expect.objectContaining({ playlist: { refresh: "daily", playlistId: "pl_1" } }),
      expect.anything()
    );
  });

  it("reuses the playlist it already created when the widget failed to save", () => {
    savePlaylist.mockImplementation((_input, options) => options.onSuccess({ id: "pl_1", name: "Night owl" }));
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Night owl" } });
    fireEvent.click(screen.getByRole("switch", { name: "Also save as a playlist" }));

    fireEvent.click(screen.getByRole("button", { name: "Save widget" }));
    fireEvent.click(screen.getByRole("button", { name: "Save widget" }));

    expect(savePlaylist).toHaveBeenCalledTimes(2);
    expect(savePlaylist.mock.calls[1]?.[0]).toMatchObject({ playlistId: "pl_1" });
  });

  it("offers a playlist only while the recipe lists tracks, and drops it otherwise", async () => {
    const user = userEvent.setup();
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    fireEvent.click(screen.getByRole("switch", { name: "Also save as a playlist" }));

    await user.click(screen.getByRole("button", { name: "Show" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /^albums/ }));
    expect(screen.queryByRole("switch", { name: "Also save as a playlist" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /^tracks/ }));
    expect(screen.getByRole("switch", { name: "Also save as a playlist" })).not.toBeChecked();
  });

  it("reads a household member's listening by name in the rule and the readback", async () => {
    const user = userEvent.setup();
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    fireEvent.click(screen.getByRole("button", { name: "Where" }));

    await user.click(screen.getByRole("button", { name: "Field" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /Whose listening/ }));
    await user.click(screen.getByRole("button", { name: "Condition" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /played by me and/ }));
    await user.click(screen.getByRole("button", { name: "Value" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /^bo/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

    expect(
      screen.getByText("Show me 10 tracks with the most plays in the last 30 days, where played by me and bo.")
    ).toBeInTheDocument();
  });

  it("takes a news feed address only once it is an http address", async () => {
    const user = userEvent.setup();
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    fireEvent.click(screen.getByRole("tab", { name: "Feed" }));
    await user.click(screen.getByRole("button", { name: "Source" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /A news feed/ }));

    const address = screen.getByRole("textbox", { name: "Feed address" });
    expect(screen.getByText("Show me 12 items from A news feed (RSS or Atom).")).toBeInTheDocument();
    fireEvent.change(address, { target: { value: "ftp://feeds.test/rss" } });
    expect(screen.getByText("Enter an http or https address.")).toBeInTheDocument();
    expect(address).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(address, { target: { value: "https://feeds.test/rss" } });
    fireEvent.blur(address);
    expect(screen.getByRole("textbox", { name: "Feed address" })).toHaveValue("https://feeds.test/rss");
    expect(screen.getByRole("radio", { name: /Headlines/ })).toHaveAttribute("aria-checked", "true");
  });

  it("switches to a feed and back without losing the recipe", () => {
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    fireEvent.click(screen.getByRole("button", { name: "Forgotten favorites" }));

    fireEvent.click(screen.getByRole("tab", { name: "Feed" }));
    expect(screen.getByText("Show me 12 items from Similar artists (Last.fm).")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Recipe" }));
    expect(screen.getByText(/daily pick of 8 tracks/)).toBeInTheDocument();
  });
});
