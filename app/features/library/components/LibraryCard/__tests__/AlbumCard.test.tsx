import { describe, it, expect, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryAlbumItem } from "@hooks/api/queries/library/types";

import { AlbumCard } from "../AlbumCard";
import type { CardSelection } from "../types";

function createLibraryAlbum(overrides?: Partial<LibraryAlbumItem>): LibraryAlbumItem {
  return {
    id: "row-1",
    external_id: "ext-1",
    name: "Discovery",
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
    ...overrides,
  };
}

describe("AlbumCard", () => {
  it("is presentational with no button semantics when onOpen is absent", () => {
    renderWithProviders(<AlbumCard item={createLibraryAlbum()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
  });

  it("opens the detail flow on click when onOpen is provided", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<AlbumCard item={createLibraryAlbum()} onOpen={onOpen} />);

    await user.click(screen.getByRole("button"));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("activates with Enter and Space when interactive", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(<AlbumCard item={createLibraryAlbum()} onOpen={onOpen} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("opens the album detail when the card itself is clicked, even with the cover actions shown", async () => {
    const onOpen = vi.fn();
    const onPlay = vi.fn(async () => undefined);
    const { user } = renderWithProviders(<AlbumCard item={createLibraryAlbum()} onOpen={onOpen} onPlay={onPlay} />);

    await user.click(screen.getByText("Daft Punk"));

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onPlay).not.toHaveBeenCalled();
  });

  it("only plays from the play button, without opening the detail", async () => {
    const onOpen = vi.fn();
    const onPlay = vi.fn(async () => undefined);
    const { user } = renderWithProviders(<AlbumCard item={createLibraryAlbum()} onOpen={onOpen} onPlay={onPlay} />);

    await user.click(screen.getByRole("button", { name: /Play everything we have of Discovery/i }));

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("plays, and does not open the detail, when Enter is pressed on the focused play button", async () => {
    const onOpen = vi.fn();
    const onPlay = vi.fn(async () => undefined);
    const { user } = renderWithProviders(<AlbumCard item={createLibraryAlbum()} onOpen={onOpen} onPlay={onPlay} />);

    screen.getByRole("button", { name: /Play everything we have of Discovery/i }).focus();
    await user.keyboard("{Enter}");

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("puts the menu where the info button was, so the card keeps a single way into the detail", () => {
    renderWithProviders(
      <AlbumCard
        item={createLibraryAlbum()}
        onOpen={vi.fn()}
        onPlay={vi.fn(async () => undefined)}
        menu={<button type="button">album menu</button>}
      />
    );

    expect(screen.getByRole("button", { name: "album menu" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Open details for Discovery/i })).toHaveLength(1);
  });

  describe("selection", () => {
    function cardSelection(overrides?: Partial<CardSelection>): CardSelection {
      return {
        selected: false,
        selecting: false,
        preview: "none",
        onToggle: vi.fn(),
        onHover: vi.fn(),
        ...overrides,
      };
    }

    it("still opens the detail on a card click while nothing is selected", async () => {
      const onOpen = vi.fn();
      const selection = cardSelection();
      const { user } = renderWithProviders(
        <AlbumCard item={createLibraryAlbum()} onOpen={onOpen} selection={selection} />
      );

      await user.click(screen.getByText("Daft Punk"));

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(selection.onToggle).not.toHaveBeenCalled();
    });

    it("toggles instead of opening the detail on a card click while selecting", async () => {
      const onOpen = vi.fn();
      const selection = cardSelection({ selecting: true });
      const { user } = renderWithProviders(
        <AlbumCard item={createLibraryAlbum()} onOpen={onOpen} selection={selection} />
      );

      await user.click(screen.getByText("Daft Punk"));

      expect(selection.onToggle).toHaveBeenCalledWith(false);
      expect(onOpen).not.toHaveBeenCalled();
    });

    it("extends the range on a shift click while selecting", async () => {
      const selection = cardSelection({ selecting: true });
      const { user } = renderWithProviders(
        <AlbumCard item={createLibraryAlbum()} onOpen={vi.fn()} selection={selection} />
      );

      await user.keyboard("{Shift>}");
      await user.click(screen.getByText("Daft Punk"));
      await user.keyboard("{/Shift}");

      expect(selection.onToggle).toHaveBeenCalledWith(true);
    });

    it("toggles with Space while selecting and reports the pressed state", async () => {
      const onOpen = vi.fn();
      const selection = cardSelection({ selecting: true, selected: true });
      const { user } = renderWithProviders(
        <AlbumCard item={createLibraryAlbum()} onOpen={onOpen} selection={selection} />
      );

      const card = screen.getByRole("button", { name: "Select Discovery" });
      expect(card).toHaveAttribute("aria-pressed", "true");
      card.focus();
      await user.keyboard(" ");

      expect(selection.onToggle).toHaveBeenCalledTimes(1);
      expect(onOpen).not.toHaveBeenCalled();
    });

    it("toggles from the checkbox without opening the detail, even when nothing is selected yet", async () => {
      const onOpen = vi.fn();
      const selection = cardSelection();
      const { user } = renderWithProviders(
        <AlbumCard item={createLibraryAlbum()} onOpen={onOpen} selection={selection} />
      );

      await user.click(screen.getByRole("checkbox", { name: "Select Discovery" }));

      expect(selection.onToggle).toHaveBeenCalledTimes(1);
      expect(onOpen).not.toHaveBeenCalled();
    });

    it("toggles once from Space on the focused checkbox without opening the detail", async () => {
      const onOpen = vi.fn();
      const selection = cardSelection();
      const { user } = renderWithProviders(
        <AlbumCard item={createLibraryAlbum()} onOpen={onOpen} selection={selection} />
      );

      screen.getByRole("checkbox", { name: "Select Discovery" }).focus();
      await user.keyboard(" ");

      expect(selection.onToggle).toHaveBeenCalledTimes(1);
      expect(onOpen).not.toHaveBeenCalled();
    });

    it("only plays from the play button while selecting", async () => {
      const onOpen = vi.fn();
      const onPlay = vi.fn(async () => undefined);
      const selection = cardSelection({ selecting: true });
      const { user } = renderWithProviders(
        <AlbumCard item={createLibraryAlbum()} onOpen={onOpen} onPlay={onPlay} selection={selection} />
      );

      await user.click(screen.getByRole("button", { name: /Play everything we have of Discovery/i }));

      expect(onPlay).toHaveBeenCalledTimes(1);
      expect(selection.onToggle).not.toHaveBeenCalled();
      expect(onOpen).not.toHaveBeenCalled();
    });

    it("marks a selected album as checked", () => {
      renderWithProviders(
        <AlbumCard item={createLibraryAlbum()} onOpen={vi.fn()} selection={cardSelection({ selected: true })} />
      );

      expect(screen.getByRole("checkbox", { name: "Select Discovery" })).toHaveAttribute("data-state", "checked");
    });
  });

  it("names the library paths the album lives in when the library has more than one", () => {
    renderWithProviders(
      <AlbumCard
        showLibraryPaths
        item={createLibraryAlbum({
          libraryPaths: [
            { id: "music", label: "Music" },
            { id: "archive", label: "Archive" },
          ],
        })}
      />
    );

    expect(screen.getByText("2001 · FLAC · Music · Archive")).toBeInTheDocument();
  });

  it("keeps the path off the card when the library has only one", () => {
    renderWithProviders(<AlbumCard item={createLibraryAlbum({ libraryPaths: [{ id: "music", label: "Music" }] })} />);

    expect(screen.getByText("2001 · FLAC")).toBeInTheDocument();
    expect(screen.queryByText(/Music/)).not.toBeInTheDocument();
  });
});
