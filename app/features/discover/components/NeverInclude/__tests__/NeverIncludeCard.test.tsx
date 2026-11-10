import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SetVeto } from "@hooks/api/queries/widgets/types";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { NeverIncludeCard } from "../NeverIncludeCard";

const { veto, saveVeto } = vi.hoisted(() => ({
  veto: { data: { artists: ["Bjork"], tracks: ["t1"], noTaste: ["ambient"] } as SetVeto | undefined },
  saveVeto: vi.fn<(next: SetVeto) => void>(),
}));

vi.mock("@hooks/api/queries/widgets/useVeto", () => ({
  useVeto: () => ({ data: veto.data }),
  useVetoTracks: () => ({ data: [{ id: "t1", title: "Joga", artist: "Bjork" }] }),
}));
vi.mock("@hooks/api/mutations/widgets/useVetoActions", () => ({
  useSaveVeto: () => ({ mutate: saveVeto, isPending: false }),
}));
vi.mock("@hooks/api/queries/library/useLibraryArtists", () => ({
  useLibraryArtists: () => ({
    items: [
      { artist: "Daft Punk", trackCount: 42, albumCount: 6, albumArt: null, genre: "electronic" },
      { artist: "Bjork", trackCount: 10, albumCount: 2, albumArt: null, genre: "art pop" },
    ],
    total: 2,
    facets: {},
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  }),
}));
vi.mock("@hooks/api/queries/library/useLibraryTracks", () => ({
  useLibraryTracks: () => ({
    items: [],
    total: 0,
    facets: {},
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  }),
}));
vi.mock("@hooks/api/queries/widgets/useSetGenres", () => ({ useSetGenres: () => ({ data: ["ambient", "rock"] }) }));
vi.mock("@hooks/ui/useDebounce", () => ({ useDebounce: <T,>(value: T) => value }));

beforeEach(() => {
  vi.clearAllMocks();
  veto.data = { artists: ["Bjork"], tracks: ["t1"], noTaste: ["ambient"] };
});

describe("NeverIncludeCard", () => {
  it("lists the account's banned artists, tracks and genres under one card", () => {
    render(<NeverIncludeCard />);

    expect(screen.getByRole("heading", { level: 2, name: "Never include" })).toBeInTheDocument();
    expect(screen.getByText("Bjork")).toBeInTheDocument();
    expect(screen.getByText("Joga · Bjork")).toBeInTheDocument();
    expect(screen.getByText("ambient")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox").map((input) => input.getAttribute("aria-label"))).toEqual([
      "Search artists",
      "Search tracks by title or artist",
      "Search genres",
    ]);
  });

  it("saves the whole veto at once when an artist is added from the search, leaving out the ones already banned", () => {
    render(<NeverIncludeCard />);
    const search = screen.getByRole("combobox", { name: "Search artists" });

    fireEvent.change(search, { target: { value: "da" } });
    const options = within(screen.getByRole("listbox", { name: "Search artists" })).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["Daft Punk"]);
    fireEvent.click(options[0]);

    expect(saveVeto).toHaveBeenCalledWith({ artists: ["Bjork", "Daft Punk"], tracks: ["t1"], noTaste: ["ambient"] });
  });

  it("saves the veto without an entry when its tag is removed", () => {
    render(<NeverIncludeCard />);

    fireEvent.click(screen.getByRole("button", { name: "Remove ambient" }));

    expect(saveVeto).toHaveBeenCalledWith({ artists: ["Bjork"], tracks: ["t1"], noTaste: [] });
  });
});
