import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import { TooltipProvider } from "@components/ui/Tooltip";
import type { BoardItem } from "@hooks/api/queries/board/types";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";
import { createWidget, createWidgetCatalog, createWidgetGrammar, createWidgetPreset } from "@test/factories";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { BOARD_MAX_ITEMS } from "../../ExploreBoard/constants";
import { customWidgetsById } from "../../ExploreBoard/helpers";
import type { BoardGalleryTarget, BoardSave } from "../../ExploreBoard/types";
import { WidgetsDialog } from "../WidgetsDialog";

const { stub } = vi.hoisted(() => ({
  stub:
    (name: string) =>
    ({ size }: { size: string }) => <div data-preview={name} data-size={size} />,
}));

vi.mock("@hooks/ui/useElementWidth", () => ({ useElementWidth: () => [() => undefined, 0] }));
vi.mock("@hooks/ui/useElementHeight", () => ({ useElementHeight: () => [() => undefined, 0] }));
vi.mock("../../NeverInclude/NeverIncludeCard", () => ({
  NeverIncludeCard: () => <section data-testid="never-include" />,
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
            params: { country: null },
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
            type: "recipe",
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
vi.mock("@hooks/api/queries/widgets/useWidgetData", () => ({
  useWidgetData: () => ({ data: undefined, isLoading: false, isError: false }),
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
vi.mock("@hooks/api/queries/widgets/useSetGrammar", () => ({ useSetGrammar: () => ({ data: undefined }) }));
vi.mock("@hooks/ui/useDebounce", () => ({ useDebounce: <T,>(value: T) => value }));
vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity: vi.fn() }) }));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: vi.fn(), requestResult: vi.fn() }),
}));

const ON_BOARD: BoardItem[] = [
  { kind: "builtin", id: "s1", widget: "scrobbles", size: "M" },
  { kind: "custom", id: "w_1", widgetId: "w_1", size: "M" },
];

function renderGallery(items: BoardItem[] = ON_BOARD, target: BoardGalleryTarget | null = null) {
  const handlers = {
    onSave: vi.fn<(save: BoardSave) => void>(),
    onClose: vi.fn(),
  };
  render(
    <TooltipProvider>
      <WidgetsDialog
        lists={{ items, mobile: items }}
        opening={{ target }}
        custom={customWidgetsById(myWidgets.data)}
        {...handlers}
      />
    </TooltipProvider>
  );
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

async function pickLayout(trigger: string, layout: string) {
  fireEvent.pointerDown(screen.getByRole("button", { name: trigger }), { button: 0, pointerType: "mouse" });
  fireEvent.click(await screen.findByRole("menuitem", { name: layout }));
}

async function pickBulk(group: "addTo" | "removeFrom", layout: string) {
  fireEvent.pointerDown(screen.getByRole("button", { name: i18n.t("discover:board.gallery.bulk.label") }), {
    button: 0,
    pointerType: "mouse",
  });
  const picked = await screen.findByRole("group", { name: i18n.t(`discover:board.gallery.bulk.${group}`) });
  fireEvent.click(within(picked).getByRole("menuitem", { name: layout }));
}

afterEach(() => {
  myWidgets.data = [];
  vi.clearAllMocks();
});

describe("WidgetsDialog gallery", () => {
  it("lists every widget in the suggested order with a scaled live preview at the default size", () => {
    renderGallery();

    expect(cardTitles()).toHaveLength(25);
    expect(cardTitles().slice(0, 3)).toEqual(["Trending now", "Continue listening", "Jump back in"]);
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(document.querySelector("[data-preview='mixes']")).toHaveAttribute("data-size", "XL");
  });

  it("searches titles and descriptions, and says when nothing matches", () => {
    renderGallery();
    const search = screen.getByRole("searchbox", { name: i18n.t("discover:board.gallery.search") });

    fireEvent.change(search, { target: { value: "listenbrainz" } });
    expect(cardTitles()).toEqual(["Your rarities", "Discover Mixes"]);

    fireEvent.change(search, { target: { value: "zzz" } });
    expect(screen.getByText(i18n.t("discover:board.gallery.empty", { query: "zzz" }))).toBeInTheDocument();
  });

  it("takes a widget off the board and puts another on it in the draft, reaching the board on Save", async () => {
    const handlers = renderGallery();

    await pickLayout("Remove Recent Scrobbles", "Both");
    await pickLayout("Add Trending now", "Desktop");

    expect(handlers.onSave).not.toHaveBeenCalled();
    expect(screen.getAllByText(i18n.t("discover:board.gallery.onBoard"))).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(handlers.onSave).toHaveBeenCalledWith({
      lists: {
        items: [ON_BOARD[1], expect.objectContaining({ kind: "builtin", widget: "trending" })],
        mobile: [ON_BOARD[1]],
      },
      appearance: null,
    });
  });

  it("adds every widget to the one layout picked from the All menu, leaving the other as it was", async () => {
    const handlers = renderGallery();

    await pickBulk("addTo", "Mobile");
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const [[saved]] = handlers.onSave.mock.calls;
    expect(saved.lists?.items).toEqual(ON_BOARD);
    expect(saved.lists?.mobile.filter((item) => item.kind === "builtin")).toHaveLength(25);
    expect(saved.lists?.mobile.slice(0, 2)).toEqual(ON_BOARD);
  });

  it("removes only the widgets the search shows, from both layouts, and keeps a custom widget", async () => {
    const handlers = renderGallery([
      ...ON_BOARD,
      { kind: "builtin", id: "trending", widget: "trending", size: "L" },
      { kind: "builtin", id: "mixes", widget: "mixes", size: "L" },
    ]);

    fireEvent.change(screen.getByRole("searchbox", { name: i18n.t("discover:board.gallery.search") }), {
      target: { value: "listenbrainz" },
    });
    await pickBulk("removeFrom", "Both");
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const kept = [...ON_BOARD, expect.objectContaining({ widget: "trending" })];
    expect(handlers.onSave).toHaveBeenCalledWith({ lists: { items: kept, mobile: kept }, appearance: null });
  });

  it("adds nothing to a layout the shown widgets would push past its limit, and says so", async () => {
    const warned = vi.spyOn(toast, "warning").mockImplementation(() => "");
    const crowded: BoardItem[] = Array.from({ length: 24 }, (_, index) => ({
      kind: "custom",
      id: `filler_${index}`,
      widgetId: "w_1",
      size: "M",
    }));
    renderGallery(crowded);

    await pickBulk("addTo", "Both");

    expect(warned).toHaveBeenCalledTimes(2);
    expect(warned).toHaveBeenCalledWith(
      i18n.t("discover:board.gallery.bulk.noRoom", { layout: "Desktop", max: BOARD_MAX_ITEMS })
    );
    expect(screen.queryByText(i18n.t("discover:board.gallery.onBoard"))).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    warned.mockRestore();
  });

  it("offers no bulk group that would change nothing, and locks the All menu when the search matches nothing", async () => {
    renderGallery([]);

    fireEvent.pointerDown(screen.getByRole("button", { name: i18n.t("discover:board.gallery.bulk.label") }), {
      button: 0,
      pointerType: "mouse",
    });
    expect(await screen.findByText(i18n.t("discover:board.gallery.bulk.addTo"))).toBeInTheDocument();
    expect(screen.queryByText(i18n.t("discover:board.gallery.bulk.removeFrom"))).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

    const trigger = screen.getByRole("button", { name: i18n.t("discover:board.gallery.bulk.label") });
    trigger.focus();
    fireEvent.change(screen.getByRole("searchbox", { name: i18n.t("discover:board.gallery.search") }), {
      target: { value: "zzz" },
    });

    const locked = screen.getByRole("button", { name: i18n.t("discover:board.gallery.bulk.label") });
    expect(locked).toBe(trigger);
    expect(locked).toHaveAttribute("aria-disabled", "true");
    expect(document.activeElement).toBe(trigger);
    fireEvent.pointerDown(locked, { button: 0, pointerType: "mouse" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.setup().hover(locked);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(i18n.t("discover:board.gallery.bulk.nothing"));
  });

  it("offers the widgets and My widgets as the lists of the Widgets dialog", () => {
    renderGallery();

    expect(screen.getByRole("dialog", { name: "Widgets" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("tablist", { name: "Widget lists" }))
        .getAllByRole("tab")
        .map((tab) => tab.textContent)
    ).toEqual(["Widgets", "My widgets"]);
  });

  it("closes from its close button", () => {
    const handlers = renderGallery();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(handlers.onClose).toHaveBeenCalledTimes(1);
  });

  it("shows my widgets with their board state and ends the grid with the new widget card", async () => {
    myWidgets.data = [createWidget(), createWidget({ id: "w_2", meta: { ...createWidget().meta, name: "Deep" } })];
    const handlers = renderGallery();
    openMine();

    const cards = screen.getAllByRole("article");
    expect(cards.map((card) => card.getAttribute("aria-label"))).toEqual(["Most played", "Deep"]);
    expect(within(cards[0]).getByText("On board")).toBeInTheDocument();
    expect(within(cards[0]).getByText("List · Recipe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New widget" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "From JSON" })).toBeInTheDocument();
    await pickLayout("Add Deep to the board", "Mobile");
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(handlers.onSave).toHaveBeenCalledWith({
      lists: {
        items: ON_BOARD,
        mobile: [...ON_BOARD, expect.objectContaining({ kind: "custom", widgetId: "w_2" })],
      },
      appearance: null,
    });
  });

  it("asks before deleting a widget and counts its tiles on both layouts", () => {
    myWidgets.data = [createWidget()];
    renderGallery();
    openMine();

    fireEvent.click(screen.getByRole("button", { name: "Delete Most played" }));
    expect(
      screen.getByText("The widget is removed from My widgets and from its 2 tiles on your board.")
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
        "Show me a daily pick of 8 tracks with the most plays all time, where played at least 10 times in the period and not played in the last 180 days."
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove rule: played at least 10 times in the period" }));
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
    expect(screen.getByText("times")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    expect(
      screen.getByRole("button", { name: "Edit rule: played at least 5 times in the period" })
    ).toBeInTheDocument();
    expect(screen.getByText(/where played at least 5 times in the period\.$/)).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Save to My widgets" }));
    expect(saveWidget).toHaveBeenCalledWith(
      expect.objectContaining({ basedOn: "Forgotten favorites", view: { block: "rail", action: "play" } }),
      expect.anything()
    );
    expect(saveWidget.mock.calls[0]?.[0]).not.toHaveProperty("id");

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(cardTitles()).toHaveLength(25);
  });

  it("customizes the charts on the detected country, which the factory widget leaves unset", () => {
    renderGallery();
    fireEvent.click(screen.getByRole("button", { name: "Customize Charts" }));
    fireEvent.click(screen.getByRole("button", { name: "Save to My widgets" }));
    expect(saveWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ source: "lastfm.charts", params: { country: "MX" } }),
      }),
      expect.anything()
    );
  });

  it("opens the workshop on the preset when the board asks to customize a tile", () => {
    renderGallery(ON_BOARD, { kind: "builtin", widget: "forgottenFavorites" });
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Forgotten favorites (custom)");
    expect(screen.getByRole("heading", { level: 2, name: "Customize Forgotten favorites" })).toBeInTheDocument();
    expect(screen.getByText(/A copy of the built-in widget/)).toBeInTheDocument();
  });

  it("opens Edit directly when the board asks to edit one of my widgets, and goes back to My widgets", () => {
    myWidgets.data = [createWidget()];
    renderGallery(ON_BOARD, { kind: "custom", widgetId: "w_1" });

    expect(screen.getByRole("heading", { level: 2, name: "Edit Most played" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "New widget" })).toBeInTheDocument();
  });

  it("stays on the gallery when the widget the board asked for is gone", () => {
    renderGallery(ON_BOARD, { kind: "custom", widgetId: "w_gone" });

    expect(cardTitles()).toHaveLength(25);
  });

  it("puts the filter first, the search after it and the tabs last", () => {
    renderGallery();
    const filter = screen.getByRole("button", { name: "Filter and sort" });
    const search = screen.getByRole("searchbox");
    const tabs = screen.getByRole("tablist", { name: "Widget lists" });

    expect(filter.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(search.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("offers the category in the filter menu and filters by it", async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));
    expect(within(await screen.findByRole("menu")).getByRole("group", { name: "Category" })).toBeInTheDocument();
    await user.click(await screen.findByRole("menuitemradio", { name: /^Library/ }));

    expect(cardTitles()).toContain("New in your library");
    expect(cardTitles()).not.toContain("Trending now");
  });

  it("shows the category and the description on the card, with Add before Customize and no info icon", () => {
    renderGallery();
    const card = screen.getByRole("heading", { level: 4, name: "Charts" }).closest("article");
    if (!card) throw new Error("card missing");

    expect(within(card).getByText("Discover")).toBeInTheDocument();
    expect(within(card).getByText(i18n.t("discover:board.widgets.charts"))).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /about|info/i })).not.toBeInTheDocument();
    const [first, second] = within(card).getAllByRole("button");
    expect(first).toHaveAccessibleName("Add Charts");
    expect(second).toHaveAccessibleName("Customize Charts");
  });

  it("draws a preview, the description and the smart playlist icon on my widget's card", () => {
    myWidgets.data = [
      createWidget({
        meta: { ...createWidget().meta, description: "Night listening" },
        playlist: { refresh: "weekly", playlistId: "pl_1" },
      }),
    ];
    renderGallery();
    openMine();
    const card = screen.getByRole("article", { name: "Most played" });

    const preview = card.querySelector("[inert]");
    if (!(preview instanceof HTMLElement)) throw new Error("preview missing");
    expect(within(preview).getByRole("heading", { name: "Most played", hidden: true })).toBeInTheDocument();
    expect(within(card).getAllByText("Night listening")).toHaveLength(2);
    const playlist = within(card).getByRole("img", { name: "Smart playlist · Weekly" });
    const json = within(card).getByRole("button", { name: "Copy the JSON of Most played" });
    expect(playlist.compareDocumentPosition(json) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("describes My widgets under its title", () => {
    renderGallery();
    openMine();

    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(/^Widgets you built or customized/);
  });

  it("moves the size and the JSON to the preview, and the playlist choice to the footer", () => {
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    const preview = screen.getByRole("complementary", { name: "Preview" });

    fireEvent.click(within(preview).getByRole("radio", { name: "L" }));
    expect(within(preview).getByRole("radio", { name: "L" })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByRole("heading", { name: "Playlist" })).not.toBeInTheDocument();

    fireEvent.click(within(preview).getByRole("button", { name: "JSON" }));
    expect(within(preview).getByText(/"defaultSize": "L"/)).toBeInTheDocument();
    expect(within(preview).getByRole("button", { name: "Copy JSON" })).toBeInTheDocument();

    expect(within(preview).queryByRole("switch")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Also save as a playlist" }));
    expect(screen.getByRole("radiogroup", { name: "Refresh" })).toBeInTheDocument();
  });

  it("illustrates each view and keeps All views beside the Look title", () => {
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));
    const heading = screen.getByRole("heading", { name: "Look" });

    expect(heading.parentElement).toContainElement(screen.getByRole("button", { name: /^All \d+ views$/ }));
    const list = screen.getByRole("radio", { name: /^List/ });
    expect(list.querySelector("[data-thumb='list'] rect")).not.toBeNull();
  });

  it("picks the rotation from a three option control in one line", () => {
    renderGallery();
    openMine();
    fireEvent.click(screen.getByRole("button", { name: "New widget" }));

    const group = screen.getByRole("radiogroup", { name: i18n.t("widgets:steps.random") });
    fireEvent.click(within(group).getByRole("radio", { name: "Daily" }));

    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByText(/daily pick of 10 tracks/)).toBeInTheDocument();
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
    const refresh = within(screen.getByRole("radiogroup", { name: "Refresh" }));
    fireEvent.click(refresh.getByRole("radio", { name: "Daily" }));
    fireEvent.click(screen.getByRole("button", { name: "Save to My widgets" }));

    expect(savePlaylist).toHaveBeenCalledWith(
      expect.objectContaining({
        playlistId: null,
        name: "Night owl",
        refresh: "daily",
        query: expect.objectContaining({ type: "recipe", subject: "tracks" }),
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

    fireEvent.click(screen.getByRole("button", { name: "Save to My widgets" }));
    fireEvent.click(screen.getByRole("button", { name: "Save to My widgets" }));

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
