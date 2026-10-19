import { afterEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import type { BoardItem } from "@hooks/api/queries/board/types";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { WidgetGallery } from "../WidgetGallery";

const { stub, viewport } = vi.hoisted(() => ({
  stub:
    (name: string) =>
    ({ size }: { size: string }) => <div data-preview={name} data-size={size} />,
  viewport: { wide: true },
}));

vi.mock("@hooks/ui/useMediaQuery", () => ({ useMediaQuery: () => viewport.wide }));
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

const ON_BOARD: BoardItem[] = [{ id: "s1", widget: "scrobbles", size: "M" }];

function renderGallery(items: BoardItem[] = ON_BOARD) {
  const handlers = { onAdd: vi.fn(), onRemove: vi.fn(), onClose: vi.fn() };
  render(<WidgetGallery items={items} {...handlers} />);
  return handlers;
}

function cardTitles(): string[] {
  return within(screen.getByRole("dialog"))
    .getAllByRole("heading", { level: 4 })
    .map((heading) => heading.textContent ?? "");
}

afterEach(() => {
  viewport.wide = true;
});

describe("WidgetGallery", () => {
  it("lists every widget under its category band with a scaled live preview at the default size", () => {
    renderGallery();

    expect(cardTitles()).toHaveLength(24);
    expect(screen.getByRole("heading", { level: 3, name: "Now" })).toBeInTheDocument();
    expect(screen.getByText("1 of 8 on board")).toBeInTheDocument();
    expect(document.querySelector("[data-preview='mixes']")).toHaveAttribute("data-size", "XL");
    expect(screen.getByText(i18n.t("discover:board.gallery.summary", { onBoard: 1, total: 24 }))).toBeInTheDocument();
  });

  it("narrows to one category without bands when a tab is chosen", () => {
    renderGallery();

    fireEvent.click(screen.getByRole("tab", { name: /From your history/ }));

    expect(cardTitles()).toEqual([
      "On repeat",
      "Repeat rewind",
      "Deep cuts",
      "Forgotten favorites",
      "This time last year",
      "Top Tracks",
      "Recent Scrobbles",
      "Your rarities",
    ]);
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
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
});
