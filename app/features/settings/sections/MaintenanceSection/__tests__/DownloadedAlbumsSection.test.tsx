import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import {
  createErrorQuery,
  createLoadingQuery,
  createMockMutation,
  createMockQuery,
  createPendingMutation,
  type MockMutationResult,
  type MockQueryResult,
} from "@test/mocks/trpc.mock";

import { makeRequestListItem } from "@features/requests/__tests__/factories";

import type { DownloadedAlbum } from "../types";

const state = vi.hoisted(() => ({
  entries: undefined as unknown,
  remove: undefined as unknown,
  clear: undefined as unknown,
}));

vi.mock("@hooks/api/queries/useStagedReleases", () => ({ useStagedReleases: () => state.entries }));
vi.mock("@hooks/api/mutations/settings/useStagedReleases", () => ({
  useRemoveStagedRelease: () => state.remove,
  useClearStagedReleases: () => state.clear,
}));

import { DownloadedAlbumsSection } from "../DownloadedAlbumsSection";

const copy = enSettings.maintenance.downloadedAlbums;
const HOUR_MS = 3_600_000;

function entry(
  id: string,
  source: DownloadedAlbum["source"],
  releaseTitle: string,
  album: DownloadedAlbum["album"] = null
): DownloadedAlbum {
  const at = new Date(Date.now() - 2 * HOUR_MS);
  return {
    id,
    source,
    releaseTitle,
    sizeBytes: 300 * 1024 * 1024,
    folderName: releaseTitle,
    createdAt: at,
    lastUsedAt: at,
    expiresAt: new Date(Date.now() + 5 * HOUR_MS + 60_000),
    album,
  };
}

const both = [
  entry("u1", "usenet", "Usenet.Album.2026"),
  entry("t1", "torrent", "pandacd-609-across-town", { externalId: "deezer-302127", name: "Across Town" }),
];

function show(
  entries: MockQueryResult<DownloadedAlbum[]>,
  remove: MockMutationResult = createMockMutation(),
  clear: MockMutationResult = createMockMutation()
) {
  state.entries = entries;
  state.remove = remove;
  state.clear = clear;
  render(<DownloadedAlbumsSection />);
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DownloadedAlbumsSection", () => {
  it("lists every kept album from both sources under the page's own title, with its size, use and expiry", () => {
    show(createMockQuery(both));

    expect(screen.getByRole("heading", { name: copy.title })).toBeInTheDocument();
    expect(screen.getByText("Usenet.Album.2026")).toBeInTheDocument();
    expect(screen.getByText("pandacd-609-across-town")).toBeInTheDocument();
    expect(screen.getAllByText("300.0 MB")).toHaveLength(2);
    expect(screen.getAllByText("expires in 5h")).toHaveLength(2);
    expect(screen.getAllByText(/^used /)).toHaveLength(2);
    expect(screen.getByText("600.0 MB in total")).toBeInTheDocument();
  });

  it("links an album to the request it was fetched for, and names no request for one it cannot place", () => {
    show(createMockQuery(both));

    const link = screen.getByRole("link", { name: "Across Town" });
    const selected = new URL(link.getAttribute("href") ?? "", "http://synthseek.local").searchParams.get("selected");
    const requests = [
      makeRequestListItem({ id: "cuid-1", external_id: "deezer-302127", name: "Across Town" }),
      makeRequestListItem({ id: "cuid-2", external_id: "deezer-1", name: "Other" }),
    ];

    expect(requests.find((request) => request.external_id === selected)?.name).toBe("Across Town");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("filters by source, counting each, and narrows the total with it", async () => {
    show(createMockQuery(both));

    const tabs = screen.getByRole("tablist", { name: copy.filterLabel });
    expect(within(tabs).getByRole("tab", { name: /All\s*2/ })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(within(tabs).getByRole("tab", { name: /Torrent\s*1/ }));

    expect(screen.getByText("pandacd-609-across-town")).toBeInTheDocument();
    expect(screen.queryByText("Usenet.Album.2026")).not.toBeInTheDocument();
    expect(screen.getByText("300.0 MB in total")).toBeInTheDocument();
  });

  it("deletes one album from its row", async () => {
    const remove = createMockMutation();
    show(createMockQuery(both), remove);

    await userEvent.click(screen.getByRole("button", { name: "Delete Usenet.Album.2026" }));

    expect(remove.mutate).toHaveBeenCalledWith({ id: "u1" });
  });

  it("deletes everything shown after confirming, every source while unfiltered and one once filtered", async () => {
    const clear = createMockMutation();
    show(createMockQuery(both), createMockMutation(), clear);

    await userEvent.click(screen.getByRole("button", { name: copy.clearAll }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(copy.confirmClear.message)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: copy.confirmClear.confirm }));
    expect(clear.mutate).toHaveBeenLastCalledWith({ source: null });

    await userEvent.click(within(screen.getByRole("tablist")).getByRole("tab", { name: /Usenet\s*1/ }));
    await userEvent.click(screen.getByRole("button", { name: copy.clearAll }));
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: copy.confirmClear.confirm })
    );
    expect(clear.mutate).toHaveBeenLastCalledWith({ source: "usenet" });
  });

  it("does nothing until the delete is confirmed", async () => {
    const clear = createMockMutation();
    show(createMockQuery(both), createMockMutation(), clear);

    await userEvent.click(screen.getByRole("button", { name: copy.clearAll }));
    await screen.findByRole("dialog");

    expect(clear.mutate).not.toHaveBeenCalled();
  });

  it("keeps the delete buttons still while a delete is on its way", () => {
    show(createMockQuery(both), createPendingMutation());

    expect(screen.getByRole("button", { name: copy.clearAll })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete Usenet.Album.2026" })).toBeDisabled();
  });

  it("says nothing is kept, and offers no delete, when the list is empty", () => {
    show(createMockQuery<DownloadedAlbum[]>([]));

    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.clearAll })).not.toBeInTheDocument();
  });

  it("says when it is loading and when it could not load", () => {
    show(createLoadingQuery<DownloadedAlbum[]>());
    expect(screen.getByText(copy.loading)).toBeInTheDocument();
    cleanup();

    show(createErrorQuery<DownloadedAlbum[]>(new Error("down")));
    expect(screen.getByText(copy.loadError)).toBeInTheDocument();
  });
});
