import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { createMockLibraryItem } from "@test/mocks/feature-hooks.mock";
import enLibrary from "@modules/i18n/messages/en/library.json";

interface ItemDetail {
  type: string;
  name: string;
  crumb: string | null;
  subtitle: string | null;
  image: string | null;
  externalUrl: string | null;
  sourceId: string;
  released: string | null;
  label: string | null;
  lastSyncedAt: string | null;
  totalTracks: number;
  trackPreview: { id: string; title: string; artist: string }[];
  hasMore: boolean;
}

const api = vi.hoisted(() => ({
  detail: undefined as ItemDetail | undefined,
  loading: false,
  calls: [] as unknown[][],
}));

vi.mock("@hooks/api/queries/library-source/useLibrarySourceItemDetail", () => ({
  useLibrarySourceItemDetail: (...args: unknown[]) => {
    api.calls.push(args);
    return { data: api.detail, isLoading: api.loading };
  },
}));

import { useLibraryDraftState } from "../../hooks/useLibraryDraftState";
import { DetailPanel } from "../DetailPanel";
import type { LibraryItem } from "../../types";

function Harness({ focusedItem, onBack }: { focusedItem: LibraryItem | null; onBack?: () => void }) {
  const draft = useLibraryDraftState();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || focusedItem === null) return;
    seeded.current = true;
    draft.setFocus(focusedItem.id);
  }, [focusedItem, draft]);

  const stillFocused = draft.state.focusedId === null ? null : focusedItem;
  return (
    <DetailPanel provider="spotify" providerName="Spotify" focusedItem={stillFocused} draft={draft} onBack={onBack} />
  );
}

function detail(overrides: Partial<ItemDetail> = {}): ItemDetail {
  return {
    type: "playlist",
    name: "Summer 2026",
    crumb: "Playlist",
    subtitle: "by arukaraz",
    image: null,
    externalUrl: "https://open.spotify.com/playlist/library-item-001",
    sourceId: "library-item-001",
    released: null,
    label: null,
    lastSyncedAt: null,
    totalTracks: 12,
    trackPreview: [{ id: "t1", title: "Digital Love", artist: "Daft Punk" }],
    hasMore: true,
    ...overrides,
  };
}

function renderPanel(item: LibraryItem | null, onBack?: () => void) {
  render(<Harness focusedItem={item} onBack={onBack} />);
  return { user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.detail = detail();
  api.loading = false;
  api.calls = [];
});

describe("the detail pane", () => {
  it("invites the listener to pick something while nothing is focused", () => {
    api.detail = undefined;

    renderPanel(null);

    expect(screen.queryByText("Summer 2026")).not.toBeInTheDocument();
  });

  it("says it is fetching rather than showing a half-built pane", () => {
    api.loading = true;
    api.detail = undefined;

    renderPanel(createMockLibraryItem());

    expect(screen.getByText(enLibrary.librarySource.detail.loading)).toBeInTheDocument();
  });

  it("says it is fetching while the answer has not arrived at all", () => {
    api.detail = undefined;

    renderPanel(createMockLibraryItem());

    expect(screen.getByText(enLibrary.librarySource.detail.loading)).toBeInTheDocument();
  });

  it("names what is focused and how many tracks it holds", () => {
    renderPanel(createMockLibraryItem());

    expect(screen.getByText("Summer 2026")).toBeInTheDocument();
    expect(
      screen.getByText(`by arukaraz · ${enLibrary.librarySource.detail.tracksByline_other.replace("{{count}}", "12")}`)
    ).toBeInTheDocument();
  });

  it("leaves the owner out of the byline when the source named none", () => {
    api.detail = detail({ subtitle: null });

    renderPanel(createMockLibraryItem());

    expect(
      screen.getByText(enLibrary.librarySource.detail.tracksByline_other.replace("{{count}}", "12"))
    ).toBeInTheDocument();
  });

  it("lists the tracks it could preview", () => {
    renderPanel(createMockLibraryItem());

    expect(screen.getByText("Digital Love")).toBeInTheDocument();
  });

  it("offers no way out to a source that has no public address for the item", () => {
    api.detail = detail({ externalUrl: null, hasMore: true });

    renderPanel(createMockLibraryItem());

    expect(
      screen.queryByText(enLibrary.librarySource.detail.openIn.replace("{{provider}}", "Spotify"))
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(enLibrary.librarySource.tracklist.viewAll.replace("{{total}}", "12"))
    ).not.toBeInTheDocument();
    expect(screen.getByText("Summer 2026")).toBeInTheDocument();
  });

  it("asks the source it was opened for, and links out to it by name", () => {
    const item = createMockLibraryItem();

    renderPanel(item);

    expect(api.calls.at(-1)).toEqual(["spotify", item.id, item.type, true]);
    expect(
      screen.getByRole("link", { name: enLibrary.librarySource.detail.openIn.replace("{{provider}}", "Spotify") })
    ).toHaveAttribute("href", "https://open.spotify.com/playlist/library-item-001");
  });
});

describe("what the pane offers", () => {
  it("offers no sync settings for something not staged for import", () => {
    renderPanel(createMockLibraryItem());

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("offers sync settings once a playlist is staged for import", async () => {
    const item = createMockLibraryItem({ imported: true });

    renderPanel(item);

    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("offers no sync settings for an album, which the source never syncs", () => {
    api.detail = detail({ type: "album" });

    renderPanel(createMockLibraryItem({ type: "album", imported: true }));

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("goes back the way the caller asked", async () => {
    const onBack = vi.fn();
    const { user } = renderPanel(createMockLibraryItem(), onBack);

    await user.click(screen.getByRole("button", { name: enLibrary.librarySource.detail.back }));

    expect(onBack).toHaveBeenCalled();
  });

  it("clears the focus itself when the caller offered no way back", async () => {
    const { user } = renderPanel(createMockLibraryItem());
    expect(screen.getByText("Summer 2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: enLibrary.librarySource.detail.back }));

    expect(screen.queryByText("Summer 2026")).not.toBeInTheDocument();
  });

  it("leaves the focus alone when the caller handled the way back itself", async () => {
    const { user } = renderPanel(createMockLibraryItem(), vi.fn());

    await user.click(screen.getByRole("button", { name: enLibrary.librarySource.detail.back }));

    expect(screen.getByText("Summer 2026")).toBeInTheDocument();
  });
});
