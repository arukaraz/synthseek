import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, waitFor } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

const rename = vi.fn();
const setVisibility = vi.fn();
const setSync = vi.fn();
const upload = vi.fn(async () => true);
const coverHook = vi.fn();
const removeCover = vi.fn();
const exportM3u = vi.fn();
const importM3u = vi.fn();
const exportCollection = vi.fn();
const downloadText = vi.fn();
const toastError = vi.hoisted(() => vi.fn());
let uploading = false;

vi.mock("@hooks/api/mutations/playlists/useRenamePlaylist", () => ({
  useRenamePlaylist: () => ({ mutate: rename, isPending: false }),
}));
vi.mock("@hooks/api/mutations/playlists/useSetPlaylistVisibility", () => ({
  useSetPlaylistVisibility: () => ({ mutate: setVisibility, isPending: false }),
}));
vi.mock("@hooks/api/mutations/playlists/useSetPlaylistSync", () => ({
  useSetPlaylistSync: () => ({ mutate: setSync, isPending: false }),
}));
vi.mock("@hooks/api/mutations/playlists/useUploadPlaylistCover", () => ({
  useUploadPlaylistCover: (playlistId: string, maxBytes: number) => {
    coverHook(playlistId, maxBytes);
    return { upload, isUploading: uploading };
  },
}));
vi.mock("@hooks/api/mutations/playlists/useRemovePlaylistCover", () => ({
  useRemovePlaylistCover: () => ({ mutate: removeCover, isPending: false }),
}));
vi.mock("@hooks/api/mutations/playlists/useExportPlaylistM3u", () => ({
  useExportPlaylistM3u: () => ({ mutate: exportM3u, isPending: false }),
}));
vi.mock("@hooks/api/mutations/playlists/useImportPlaylistM3u", () => ({
  useImportPlaylistM3u: () => ({ mutateAsync: importM3u, isPending: false }),
}));
vi.mock("@hooks/api/queries/portability/useExportCollection", () => ({
  useExportCollection: () => ({ exportCollection }),
}));
vi.mock("@hooks/api", () => ({ usePlaylistSyncTargets: () => ({ data: [] }) }));
vi.mock("@hooks/api/mutations/requests/useSyncPlaylistTo", () => ({
  useSyncPlaylistTo: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@components/DeletePlaylistDialog", () => ({
  DeletePlaylistDialog: ({ open }: { open: boolean }) => (open ? <div role="dialog">delete dialog</div> : null),
}));
vi.mock("@utils/download", () => ({ downloadText: (...args: unknown[]) => downloadText(...args) }));
vi.mock("sonner", () => ({ toast: { error: toastError, success: vi.fn(), info: vi.fn() } }));

import { WorkshopDetails } from "../WorkshopDetails";
import type { WorkshopDetailsProps } from "../types";

function details(overrides?: Partial<WorkshopDetailsProps>) {
  const props: WorkshopDetailsProps = {
    playlistId: "pl-1",
    name: "Road Trip",
    cover: null,
    hasCustomCover: false,
    canEditTracks: true,
    limits: { nameChars: 200, coverBytes: 4096, coverTypes: ["image/png", "image/webp"], fileChars: 64 },
    origin: { kind: "created" },
    visibility: "shared",
    sourceProvider: null,
    syncEnabled: false,
    canRename: true,
    trackCount: 12,
    minutes: 40,
    inLibrary: 9,
    settleOrder: vi.fn(async () => undefined),
    onDeleted: vi.fn(),
    ...overrides,
  };
  return renderWithProviders(<WorkshopDetails {...props} />);
}

function file(name: string, content: string, type = "text/plain") {
  const made = new File([content], name, { type });
  Object.defineProperty(made, "text", { value: async () => content });
  return made;
}

beforeEach(() => {
  vi.clearAllMocks();
  uploading = false;
});

describe("WorkshopDetails name", () => {
  it("saves a changed name when the field loses focus and ignores an unchanged or blank one", async () => {
    details();
    const input = screen.getByLabelText("Name");

    await userEvent.clear(input);
    await userEvent.type(input, "  Night Drive  ");
    await userEvent.tab();
    expect(rename).toHaveBeenCalledWith({ playlistId: "pl-1", name: "Night Drive" });

    rename.mockClear();
    await userEvent.clear(input);
    await userEvent.tab();
    expect(rename).not.toHaveBeenCalled();
    expect(input).toHaveValue("Road Trip");
  });

  it("takes the longest name, the cover size and the cover formats from what the server allows", () => {
    details();

    expect(screen.getByLabelText("Name")).toHaveAttribute("maxlength", "200");
    expect(coverHook).toHaveBeenLastCalledWith("pl-1", 4096);
    expect(document.querySelector('[data-cy="workshop-cover-input"]')).toHaveAttribute(
      "accept",
      "image/png,image/webp"
    );
  });

  it("locks the name of a playlist that is kept in sync", () => {
    details({ canRename: false });
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });
});

describe("WorkshopDetails visibility", () => {
  it("changes who can see the playlist, and does nothing when the current choice is pressed", async () => {
    details();

    await userEvent.click(screen.getByRole("button", { name: /Shared/ }));
    expect(setVisibility).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: /Private/ }));
    expect(setVisibility).toHaveBeenCalledWith({ playlistId: "pl-1", visibility: "private" });
  });
});

describe("WorkshopDetails cover", () => {
  it("uploads the chosen picture and offers no removal while the playlist has no cover of its own", async () => {
    details();
    expect(screen.queryByRole("button", { name: "Remove the cover" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload a cover" })).toBeInTheDocument();

    const picture = file("cover.png", "bytes", "image/png");
    await userEvent.upload(document.querySelector<HTMLInputElement>('[data-cy="workshop-cover-input"]')!, picture);
    expect(upload).toHaveBeenCalledWith(picture);
  });

  it("offers to replace or remove a cover the playlist already has", async () => {
    details({ cover: "/api/v1/playlist-covers/pl-1/abc", hasCustomCover: true });
    expect(screen.getByRole("button", { name: "Replace the cover" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Remove the cover" }));
    expect(removeCover).toHaveBeenCalledWith({ playlistId: "pl-1" });
  });

  it("holds both cover buttons while an upload is running", () => {
    uploading = true;
    details({ cover: "/api/v1/playlist-covers/pl-1/abc", hasCustomCover: true });
    expect(screen.getByRole("button", { name: "Replace the cover" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove the cover" })).toBeDisabled();
  });
});

describe("WorkshopDetails files", () => {
  const report = {
    entries: 8,
    recognized: 6,
    alreadyPresent: 2,
    added: 4,
    unmatched: [],
    unmatchedCount: 0,
    committed: false,
  };

  it("names the lines it could not find, and says how many more there are", async () => {
    importM3u.mockResolvedValueOnce({
      ...report,
      unmatched: ["/nowhere/One.flac", "/nowhere/Two.flac"],
      unmatchedCount: 5,
    });
    details();

    await userEvent.upload(
      document.querySelector<HTMLInputElement>('[data-cy="workshop-m3u-input"]')!,
      file("list.m3u8", "/music/a.flac")
    );

    const preview = await screen.findByRole("status");
    expect(preview).toHaveTextContent("5 lines were not found in your library");
    expect(preview).toHaveTextContent("/nowhere/One.flac");
    expect(preview).toHaveTextContent("/nowhere/Two.flac");
    expect(preview).toHaveTextContent("and 3 more");
  });

  it("says nothing about missing lines when every line matched", async () => {
    importM3u.mockResolvedValueOnce(report);
    details();

    await userEvent.upload(
      document.querySelector<HTMLInputElement>('[data-cy="workshop-m3u-input"]')!,
      file("list.m3u8", "/music/a.flac")
    );

    expect(await screen.findByRole("status")).not.toHaveTextContent("not found");
  });

  it("refuses a file larger than the server takes, without sending it", async () => {
    details();

    await userEvent.upload(
      document.querySelector<HTMLInputElement>('[data-cy="workshop-m3u-input"]')!,
      file("big.m3u8", "x".repeat(65))
    );

    expect(toastError).toHaveBeenCalledWith("That file is larger than 64 B");
    expect(importM3u).not.toHaveBeenCalled();
  });

  it("previews a playlist file before it adds anything, then adds on confirmation", async () => {
    importM3u.mockResolvedValueOnce(report).mockResolvedValueOnce({ ...report, committed: true });
    details();

    await userEvent.upload(
      document.querySelector<HTMLInputElement>('[data-cy="workshop-m3u-input"]')!,
      file("list.m3u8", "#EXTM3U\n/music/a.flac\n")
    );

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("6 of 8 lines matched a track in your library")
    );
    expect(screen.getByRole("status")).toHaveTextContent("2 are already in this playlist");
    expect(importM3u).toHaveBeenCalledTimes(1);
    expect(importM3u).toHaveBeenLastCalledWith({
      playlistId: "pl-1",
      content: "#EXTM3U\n/music/a.flac\n",
      commit: false,
    });

    await userEvent.click(screen.getByRole("button", { name: "Add 4 tracks" }));
    expect(importM3u).toHaveBeenLastCalledWith({
      playlistId: "pl-1",
      content: "#EXTM3U\n/music/a.flac\n",
      commit: true,
    });
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });

  it("offers nothing to add when every recognised track is already there, and cancel closes the preview", async () => {
    importM3u.mockResolvedValueOnce({ ...report, alreadyPresent: 6, added: 0 });
    details();

    await userEvent.upload(
      document.querySelector<HTMLInputElement>('[data-cy="workshop-m3u-input"]')!,
      file("list.m3u8", "/music/a.flac")
    );

    expect(await screen.findByRole("button", { name: "Nothing to add" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(importM3u).toHaveBeenCalledTimes(1);
  });

  it("does not send an empty file and shows no preview when the server refuses the file", async () => {
    details();
    const input = document.querySelector<HTMLInputElement>('[data-cy="workshop-m3u-input"]')!;

    await userEvent.upload(input, file("empty.m3u", "   \n"));
    expect(importM3u).not.toHaveBeenCalled();

    importM3u.mockRejectedValueOnce(new Error("too large"));
    await userEvent.upload(input, file("list.m3u", "/music/a.flac"));
    await waitFor(() => expect(importM3u).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("hides the import on a playlist whose tracks cannot be edited, and still exports", async () => {
    details({ canEditTracks: false });
    expect(screen.queryByRole("button", { name: /Add tracks from a file/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Export as M3U/ }));
    await waitFor(() => expect(exportM3u).toHaveBeenCalledWith({ playlistId: "pl-1" }));
  });

  it("exports only once an order save that was still waiting has settled", async () => {
    let settle: () => void = () => undefined;
    const saving = new Promise<void>((resolve) => {
      settle = resolve;
    });
    const settleOrder = vi.fn(() => saving);
    exportCollection.mockResolvedValue({ playlist: { title: "Road Trip" } });
    details({ settleOrder });

    await userEvent.click(screen.getByRole("button", { name: /Export as M3U/ }));
    await userEvent.click(screen.getByRole("button", { name: /Export as JSPF/ }));
    expect(settleOrder).toHaveBeenCalledTimes(2);
    expect(exportM3u).not.toHaveBeenCalled();
    expect(exportCollection).not.toHaveBeenCalled();

    settle();
    await waitFor(() => expect(exportCollection).toHaveBeenCalledTimes(1));
    expect(exportM3u).toHaveBeenCalledWith({ playlistId: "pl-1" });
  });

  it("downloads the JSPF export under the playlist's name, and reports a failed export", async () => {
    exportCollection.mockResolvedValueOnce({ playlist: { title: "Road Trip" } });
    details();

    await userEvent.click(screen.getByRole("button", { name: /Export as JSPF/ }));
    await waitFor(() =>
      expect(downloadText).toHaveBeenCalledWith(
        "road-trip.jspf",
        JSON.stringify({ playlist: { title: "Road Trip" } }, null, 2)
      )
    );
    expect(exportCollection).toHaveBeenCalledWith({ id: "pl-1", type: "playlist" });

    exportCollection.mockRejectedValueOnce(new Error("boom"));
    await userEvent.click(screen.getByRole("button", { name: /Export as JSPF/ }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Could not export the playlist"));
    expect(downloadText).toHaveBeenCalledTimes(1);
  });
});

describe("WorkshopDetails sync and delete", () => {
  it("shows the keep in sync switch only for an imported playlist", async () => {
    const { unmount } = details();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    unmount();

    details({ sourceProvider: "deezer", syncEnabled: false, origin: { kind: "imported", provider: "deezer" } });
    await userEvent.click(screen.getByRole("switch"));
    expect(setSync).toHaveBeenCalledWith({ playlistId: "pl-1", enabled: true });
  });

  it("asks before deleting", async () => {
    details();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete playlist" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
