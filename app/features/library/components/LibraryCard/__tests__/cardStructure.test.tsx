import { describe, expect, it, vi } from "vitest";

import type { LibraryAlbumItem, LibraryArtistItem } from "@hooks/api/queries/library/types";
import { renderWithProviders, screen, within } from "@test/test-utils";

import { AlbumCard } from "../AlbumCard";
import { ArtistCard } from "../ArtistCard";
import { shieldOwnClick } from "../helpers";
import { LibraryInfiniteGrid } from "../LibraryInfiniteGrid";
import { LibraryListRow } from "../LibraryListRow";
import type { CardSelection } from "../types";

vi.mock("@hooks/ui/useInfiniteScroll", () => ({ useInfiniteScroll: () => ({ current: null }) }));

const INTERACTIVE = "button, a[href], input, select, textarea, [role=button], [role=checkbox], [role=menuitem]";

function createAlbum(id: string, name: string): LibraryAlbumItem {
  return {
    id,
    external_id: `ext-${id}`,
    name,
    artist: "Daft Punk",
    album_art: null,
    status: "complete",
    total_tracks: 14,
    completed_tracks: 14,
    source_provider: null,
    release_date: "2001-03-12",
    genres: ["electronic"],
    year: 2001,
    quality: "FLAC",
    requested: true,
    libraryPaths: [],
    created_at: new Date("2001-03-12T00:00:00.000Z"),
  };
}

function createArtist(): LibraryArtistItem {
  return { id: "artist-1", artist: "Daft Punk", trackCount: 42, albumCount: 6, albumArt: null, genre: "electronic" };
}

function selection(overrides: Partial<CardSelection> = {}): CardSelection {
  return { selected: false, selecting: false, preview: "none", onToggle: vi.fn(), onHover: vi.fn(), ...overrides };
}

function expectNoNestedControls(root: HTMLElement) {
  const controls = Array.from(root.querySelectorAll(INTERACTIVE));
  expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) {
    expect(control.querySelector(INTERACTIVE)).toBeNull();
  }
}

function itemOf(control: HTMLElement): HTMLElement {
  const item = control.closest("li");
  if (item === null) throw new Error("The control is not inside a list item");
  return item;
}

describe("AlbumCard structure", () => {
  it("keeps every control beside the others, with the card itself a plain list item", () => {
    renderWithProviders(
      <AlbumCard
        item={createAlbum("a1", "Discovery")}
        onOpen={vi.fn()}
        onPlay={vi.fn(async () => undefined)}
        selection={selection()}
        menu={<button type="button">Album menu</button>}
      />
    );

    const card = itemOf(screen.getByRole("button", { name: "Open details for Discovery" }));

    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
    expectNoNestedControls(card);
  });

  it("names its primary control after the album and opens from it once per press", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<AlbumCard item={createAlbum("a1", "Discovery")} onOpen={onOpen} />);

    const open = screen.getByRole("button", { name: "Open details for Discovery" });
    await user.click(open);
    open.focus();
    await user.keyboard("{Enter}");

    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("reports whether the card is picked from its primary control while selecting", () => {
    renderWithProviders(
      <AlbumCard
        item={createAlbum("a1", "Discovery")}
        onOpen={vi.fn()}
        selection={selection({ selecting: true, selected: true })}
      />
    );

    expect(screen.getByRole("button", { name: "Select Discovery" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("ArtistCard and LibraryListRow structure", () => {
  it("keeps an artist card's play control beside its primary control", () => {
    renderWithProviders(<ArtistCard item={createArtist()} onOpen={vi.fn()} onPlay={vi.fn(async () => undefined)} />);

    const card = itemOf(screen.getByRole("button", { name: "Open details for Daft Punk" }));

    expect(card).not.toHaveAttribute("role");
    expectNoNestedControls(card);
  });

  it("keeps a phone row's trailing action beside its primary control", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(
      <LibraryListRow
        title="Discovery"
        subtitle="Daft Punk"
        openLabel="Open Discovery"
        artwork={<span />}
        onOpen={onOpen}
        trailing={
          <div onClick={shieldOwnClick}>
            <button type="button">Row menu</button>
          </div>
        }
      />
    );

    const row = itemOf(screen.getByRole("button", { name: "Open Discovery" }));
    expect(
      within(row)
        .getAllByRole("button")
        .map((button) => button.textContent)
    ).toEqual(["Discovery", "Row menu"]);
    expectNoNestedControls(row);

    await user.click(screen.getByRole("button", { name: "Row menu" }));
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe("LibraryInfiniteGrid set size and position", () => {
  const items = [createAlbum("a1", "Discovery"), createAlbum("a2", "Homework")];

  function renderGrid(total?: number) {
    return renderWithProviders(
      <LibraryInfiniteGrid
        items={items}
        total={total}
        ariaLabel="Albums"
        renderCard={(item) => <AlbumCard item={item} onOpen={vi.fn()} />}
        getCardId={(item) => item.id}
        scrollRoot={null}
        hasNextPage
        isFetchingNextPage={false}
        fetchNextPage={vi.fn()}
      />
    );
  }

  it("gives each card its place in the whole library, not in what has loaded", () => {
    renderGrid(480);

    const cards = within(screen.getByRole("list", { name: "Albums" })).getAllByRole("listitem");

    expect(cards.map((card) => card.getAttribute("aria-posinset"))).toEqual(["1", "2"]);
    expect(cards.map((card) => card.getAttribute("aria-setsize"))).toEqual(["480", "480"]);
  });

  it("counts what is loaded when the library size is not known", () => {
    renderGrid();

    const cards = within(screen.getByRole("list", { name: "Albums" })).getAllByRole("listitem");

    expect(cards.map((card) => card.getAttribute("aria-setsize"))).toEqual(["2", "2"]);
  });
});
