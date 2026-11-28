import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";

import type { LibraryItem, LibraryItemType, WatchCapabilities } from "../types";
import type { LibraryDraft } from "../hooks/useLibraryDraftState";
import { createMockLibraryItem } from "@test/mocks/feature-hooks.mock";

const saveMutateAsync = vi.fn().mockResolvedValue(undefined);
const refetch = vi.fn().mockResolvedValue(undefined);
const invalidateSources = vi.fn();
const itemsCalls = vi.hoisted(() => ({ args: [] as unknown[][] }));

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
}));

function buildSource(overrides: Partial<LibrarySourceDescription> = {}): LibrarySourceDescription {
  return {
    provider: "spotify",
    name: "Spotify",
    configured: true,
    connected: true,
    pending: false,
    needsReconnect: false,
    externalUsername: null,
    capabilities: {
      connect: "oauth",
      itemTypes: ["playlist", "album", "liked"],
      watch: { playlists: true, savedAlbums: true },
      streamsAudio: false,
      playlistLinks: { accepted: false, needsConnection: false },
    },
    ...overrides,
  };
}

let sources: LibrarySourceDescription[] | undefined;
let libraryItems: {
  data: LibraryItem[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: typeof refetch;
};
let subscriptionData: { watch_new_playlists: boolean; watch_saved_albums: boolean } | undefined;
let savePending: boolean;

vi.mock("sonner", () => ({
  toast: { error: toastMocks.error, warning: toastMocks.warning, success: toastMocks.success },
}));

vi.mock("@hooks/api/queries/library-source/useLibrarySources", () => ({
  useLibrarySources: () => ({ data: sources }),
}));

vi.mock("@hooks/api/queries/library-source/useLibrarySourceItems", () => ({
  useLibrarySourceItems: (...args: unknown[]) => {
    itemsCalls.args.push(args);
    return libraryItems;
  },
}));

vi.mock("@hooks/api/queries/library-source/useInvalidateLibrarySources", () => ({
  useInvalidateLibrarySources: () => invalidateSources,
}));

vi.mock("@hooks/api/queries/library-source/useLibrarySubscription", () => ({
  useLibrarySubscription: () => ({ data: subscriptionData }),
}));

vi.mock("@hooks/api/mutations/library-source/useSaveLibrarySourceChanges", () => ({
  useSaveLibrarySourceChanges: () => ({ mutateAsync: saveMutateAsync, isPending: savePending }),
}));

interface BottombarCapture {
  download: { enabled: boolean; onChange: (enabled: boolean) => void; providerName: string } | null;
  onSave: () => void;
  onCancel: () => void;
  onRefresh: () => void;
  hasChanges: boolean;
  isSaving: boolean;
  isRefreshing: boolean;
  totalRows: number;
  totalTracks: number;
}

interface ToolbarCapture {
  providerName: string;
  itemTypes: ReadonlyArray<LibraryItemType>;
  watch: WatchCapabilities;
  onSearchChange: (value: string) => void;
  onWatchChange: (next: Partial<{ playlists: boolean; savedAlbums: boolean }>) => void;
}

interface SelectionBarCapture {
  selectedCount: number;
  syncState: "on" | "off" | "mixed";
  importState: "on" | "off" | "mixed";
  hasPlaylists: boolean;
  isMixedType: boolean;
  onActivateSync: () => void;
  onActivateImport: () => void;
  onClear: () => void;
  disabled: boolean;
}

interface LinkFieldCapture {
  source: LibrarySourceDescription;
  connected: boolean;
  onLoaded: (item: LibraryItem) => void;
}

let linkFieldProps: LinkFieldCapture | null = null;
let bottombarProps: BottombarCapture | null = null;
let toolbarProps: ToolbarCapture | null = null;
let selectionBarProps: SelectionBarCapture | null = null;
let capturedDraft: LibraryDraft | null = null;

vi.mock("../components/ModalTopbar", () => ({
  ModalTopbar: (props: { provider: string; name: string }) => (
    <div data-testid="topbar" data-provider={props.provider} data-name={props.name} />
  ),
}));

vi.mock("../components/ModalToolbar", () => ({
  ModalToolbar: (props: ToolbarCapture) => {
    toolbarProps = props;
    return (
      <button type="button" data-testid="toolbar-search" onClick={() => props.onSearchChange("alpha")}>
        search
      </button>
    );
  },
}));

vi.mock("../components/SelectionBulkBar", () => ({
  SelectionBulkBar: (props: SelectionBarCapture) => {
    selectionBarProps = props;
    return (
      <div
        data-testid="selection-bar"
        data-count={props.selectedCount}
        data-sync-state={props.syncState}
        data-import-state={props.importState}
        data-has-playlists={String(props.hasPlaylists)}
        data-mixed-type={String(props.isMixedType)}
      />
    );
  },
}));

vi.mock("../components/MasterTable", () => ({
  MasterTable: (props: { items: LibraryItem[]; draft: LibraryDraft; selectionBar: ReactNode; footer?: ReactNode }) => {
    capturedDraft = props.draft;
    return (
      <div data-testid="master-table" data-count={props.items.length} data-ids={props.items.map((i) => i.id).join(",")}>
        {props.selectionBar}
        {props.footer}
      </div>
    );
  },
}));

vi.mock("../components/PlaylistLinkField", () => ({
  PlaylistLinkField: (props: LinkFieldCapture) => {
    linkFieldProps = props;
    return <div data-testid="link-field" data-connected={String(props.connected)} />;
  },
}));

vi.mock("../components/DetailPanel", () => ({
  DetailPanel: (props: { provider: string; providerName: string; focusedItem: LibraryItem | null }) => (
    <div
      data-testid="detail-panel"
      data-provider={props.provider}
      data-provider-name={props.providerName}
      data-focused={props.focusedItem?.id ?? "none"}
    />
  ),
}));

vi.mock("../components/ModalBottombar", () => ({
  ModalBottombar: (props: BottombarCapture) => {
    bottombarProps = props;
    return <div data-testid="bottombar" data-haschanges={String(props.hasChanges)} />;
  },
}));

vi.mock("../components/ConnectPrompt", () => ({
  ConnectPrompt: (props: { source: LibrarySourceDescription | undefined; expired?: boolean; inline?: boolean }) => (
    <div
      data-testid="connect-prompt"
      data-source={props.source?.provider ?? "none"}
      data-pending={String(props.source?.pending ?? false)}
      data-expired={String(Boolean(props.expired))}
      data-inline={String(Boolean(props.inline))}
    />
  ),
}));

import { render, screen, act } from "@testing-library/react";
import { LibrarySourceModal } from "../LibrarySourceModal";

function resetState() {
  sources = [buildSource()];
  itemsCalls.args = [];
  libraryItems = {
    data: [
      createMockLibraryItem({ id: "a", type: "playlist", name: "Alpha", totalTracks: 3, imported: false }),
      createMockLibraryItem({
        id: "b",
        type: "album",
        name: "Beta",
        totalTracks: 5,
        imported: true,
        localId: "loc-b",
        syncEnabled: false,
      }),
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch,
  };
  subscriptionData = { watch_new_playlists: false, watch_saved_albums: false };
  savePending = false;
  bottombarProps = null;
  linkFieldProps = null;
  toolbarProps = null;
  selectionBarProps = null;
  capturedDraft = null;
}

describe("LibrarySourceModal", () => {
  beforeEach(() => {
    resetState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the connected layout when the account is connected", () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("topbar")).toBeInTheDocument();
    expect(screen.getByTestId("master-table")).toHaveAttribute("data-count", "2");
    expect(screen.getByTestId("bottombar")).toBeInTheDocument();
  });

  it("renders the connect prompt when not connected", () => {
    sources = [buildSource({ connected: false, pending: true })];

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    const prompt = screen.getByTestId("connect-prompt");
    expect(prompt).toHaveAttribute("data-source", "spotify");
    expect(prompt).toHaveAttribute("data-pending", "true");
    expect(screen.queryByTestId("topbar")).not.toBeInTheDocument();
  });

  it("hands the connect prompt no source while the sources resolve", () => {
    sources = undefined;

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("connect-prompt")).toHaveAttribute("data-source", "none");
    expect(itemsCalls.args.at(-1)).toEqual(["spotify", false]);
  });

  it("hands the chosen source's name and capabilities to the topbar, toolbar and detail panel", () => {
    sources = [
      buildSource({
        name: "Navi",
        capabilities: {
          connect: "oauth",
          itemTypes: ["playlist"],
          watch: { playlists: true, savedAlbums: false },
          streamsAudio: false,
          playlistLinks: { accepted: false, needsConnection: false },
        },
      }),
    ];

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("topbar")).toHaveAttribute("data-name", "Navi");
    expect(screen.getByTestId("topbar")).toHaveAttribute("data-provider", "spotify");
    expect(toolbarProps?.providerName).toBe("Navi");
    expect(toolbarProps?.itemTypes).toEqual(["playlist"]);
    expect(toolbarProps?.watch).toEqual({ playlists: true, savedAlbums: false });
    expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-provider", "spotify");
    expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-provider-name", "Navi");
    expect(itemsCalls.args.at(-1)).toEqual(["spotify", true]);
  });

  it("reports no changes for an untouched draft", () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "false");
  });

  it("flags changes once a watch toggle differs from the subscription", () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      toolbarProps?.onWatchChange({ playlists: true });
    });

    expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "true");
  });

  it("flags changes after a bulk import activation and saves the imports", async () => {
    const onOpenChange = vi.fn();
    render(<LibrarySourceModal provider="spotify" open onOpenChange={onOpenChange} />);

    act(() => {
      capturedDraft?.toggleSelect("a");
    });
    act(() => {
      selectionBarProps?.onActivateImport();
    });
    expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "true");

    await act(async () => {
      await bottombarProps?.onSave();
    });

    expect(saveMutateAsync).toHaveBeenCalledTimes(1);
    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.provider).toBe("spotify");
    expect(payload.toImport[0]).toMatchObject({ id: "a", type: "playlist" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("writes sync only to playlists in the selection on a sync activation", async () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      capturedDraft?.toggleSelect("a");
      capturedDraft?.toggleSelect("b");
    });
    act(() => {
      selectionBarProps?.onActivateSync();
    });

    await act(async () => {
      await bottombarProps?.onSave();
    });

    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.toToggleSync).toEqual([]);
    expect(payload.toImport).toHaveLength(0);
    expect(capturedDraft?.state.syncOverrides.has("a")).toBe(true);
    expect(capturedDraft?.state.syncOverrides.has("b")).toBe(false);
  });

  it("toggles sync on an already imported playlist and emits it on save", async () => {
    libraryItems = {
      data: [
        createMockLibraryItem({ id: "a", type: "playlist", name: "Alpha", totalTracks: 3, imported: false }),
        createMockLibraryItem({
          id: "p",
          type: "playlist",
          name: "Imported Playlist",
          totalTracks: 8,
          imported: true,
          localId: "loc-p",
          syncEnabled: false,
        }),
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch,
    };

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      capturedDraft?.toggleSelect("p");
    });
    act(() => {
      selectionBarProps?.onActivateSync();
    });

    await act(async () => {
      await bottombarProps?.onSave();
    });

    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.toToggleSync).toEqual([{ localId: "loc-p", syncEnabled: true }]);
  });

  it("disables the sync toggle and marks no playlists when only albums are selected", () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      capturedDraft?.toggleSelect("b");
    });

    expect(screen.getByTestId("selection-bar")).toHaveAttribute("data-has-playlists", "false");
  });

  it("flags a mixed-type selection when playlists and albums are both selected", () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      capturedDraft?.toggleSelect("a");
      capturedDraft?.toggleSelect("b");
    });

    expect(screen.getByTestId("selection-bar")).toHaveAttribute("data-mixed-type", "true");
    expect(screen.getByTestId("selection-bar")).toHaveAttribute("data-has-playlists", "true");
  });

  it("clears sync when import is turned off for the selection", () => {
    libraryItems = {
      data: [
        createMockLibraryItem({
          id: "p",
          type: "playlist",
          name: "Imported Playlist",
          totalTracks: 8,
          imported: true,
          localId: "loc-p",
          syncEnabled: true,
        }),
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch,
    };

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      capturedDraft?.toggleSelect("p");
    });
    expect(screen.getByTestId("selection-bar")).toHaveAttribute("data-import-state", "on");
    act(() => {
      selectionBarProps?.onActivateImport();
    });

    expect(capturedDraft?.state.importOverrides.get("p")).toBe(false);
    expect(capturedDraft?.state.syncOverrides.get("p")).toBe(false);
  });

  it("carries the sync intent into the import payload when both overrides are set", async () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      capturedDraft?.toggleSelect("a");
    });
    act(() => {
      selectionBarProps?.onActivateImport();
      selectionBarProps?.onActivateSync();
    });

    await act(async () => {
      await bottombarProps?.onSave();
    });

    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.toImport[0]).toMatchObject({ id: "a", type: "playlist", syncEnabled: true });
  });

  it("offers no download choice for a source that cannot play the tracks itself, and always downloads", async () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(bottombarProps?.download).toBeNull();
    await act(async () => {
      await bottombarProps?.onSave();
    });
    expect(saveMutateAsync.mock.calls[0][0].download).toBe(true);
  });

  it("lets a source that holds the audio import without downloading, on by default", async () => {
    sources = [
      buildSource({
        name: "Navidrome",
        capabilities: {
          connect: "oauth",
          itemTypes: ["playlist"],
          watch: { playlists: true, savedAlbums: false },
          streamsAudio: true,
          playlistLinks: { accepted: false, needsConnection: false },
        },
      }),
    ];
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(bottombarProps?.download).toMatchObject({ enabled: true, providerName: "Navidrome" });
    act(() => {
      bottombarProps?.download?.onChange(false);
    });
    await act(async () => {
      await bottombarProps?.onSave();
    });

    expect(saveMutateAsync.mock.calls[0][0].download).toBe(false);
  });

  it("sends the subscription block only when the watch flags change", async () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      toolbarProps?.onWatchChange({ savedAlbums: true });
    });

    await act(async () => {
      await bottombarProps?.onSave();
    });

    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.subscription).toEqual({ watch_new_playlists: false, watch_saved_albums: true });
  });

  it("omits the subscription block when the watch flags are unchanged", async () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    await act(async () => {
      await bottombarProps?.onSave();
    });

    expect(saveMutateAsync.mock.calls[0][0].subscription).toBeUndefined();
  });

  it("refetches the library on refresh", () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      bottombarProps?.onRefresh();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("closes the modal on cancel", () => {
    const onOpenChange = vi.fn();
    render(<LibrarySourceModal provider="spotify" open onOpenChange={onOpenChange} />);

    act(() => {
      bottombarProps?.onCancel();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("derives the initial watch state from the subscription", () => {
    subscriptionData = { watch_new_playlists: true, watch_saved_albums: false };

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "false");
  });

  it("navigates rows with the keyboard and toggles selection with space", () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    });
    expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-focused", "b");

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    });
    expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-focused", "a");

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    });
    expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-focused", "b");

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    });
    expect(capturedDraft?.state.selectedIds.has("b")).toBe(true);
  });

  it("ignores keyboard navigation when typing in an input", () => {
    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    const input = document.createElement("input");
    document.body.appendChild(input);

    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });

    expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-focused", "none");
    input.remove();
  });

  it("does not navigate when there are no rows", () => {
    libraryItems = { data: [], isLoading: false, isFetching: false, isError: false, error: null, refetch };

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    });

    expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-focused", "none");
  });

  it("does not register keyboard handlers when closed", () => {
    render(<LibrarySourceModal provider="spotify" open={false} onOpenChange={vi.fn()} />);

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    });

    expect(screen.queryByTestId("detail-panel")).not.toBeInTheDocument();
  });

  it("flips to the reconnect prompt on a reauth-required library error", () => {
    libraryItems = {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { data: { appCode: "LIBRARY_SOURCE_REAUTH_REQUIRED" } },
      refetch,
    };

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    const prompt = screen.getByTestId("connect-prompt");
    expect(prompt).toHaveAttribute("data-expired", "true");
    expect(screen.queryByTestId("topbar")).not.toBeInTheDocument();
  });

  it("fires the reauth toast once and invalidates the connection status", () => {
    libraryItems = {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { data: { appCode: "LIBRARY_SOURCE_REAUTH_REQUIRED" } },
      refetch,
    };

    const { rerender } = render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);
    rerender(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(toastMocks.error).toHaveBeenCalledTimes(1);
    expect(toastMocks.error).toHaveBeenCalledWith("Library connection expired", expect.anything());
    expect(invalidateSources).toHaveBeenCalledTimes(1);
  });

  it("keeps the connected view on a generic library error and fires a generic toast", () => {
    libraryItems = {
      data: [],
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { message: "boom" },
      refetch,
    };

    render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("topbar")).toBeInTheDocument();
    expect(screen.queryByTestId("connect-prompt")).not.toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledTimes(1);
    expect(toastMocks.error).toHaveBeenCalledWith("Could not load your Spotify library", expect.anything());
    expect(invalidateSources).not.toHaveBeenCalled();
  });

  describe("playlist links", () => {
    function linkSource(overrides: Partial<LibrarySourceDescription> = {}) {
      return buildSource({
        provider: "youtube",
        name: "YouTube",
        capabilities: {
          connect: "session",
          itemTypes: ["playlist", "liked"],
          watch: { playlists: true, savedAlbums: false },
          streamsAudio: false,
          playlistLinks: { accepted: true, needsConnection: false },
        },
        ...overrides,
      });
    }

    it("offers no link field to a source that does not accept playlist links", () => {
      render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

      expect(screen.queryByTestId("link-field")).not.toBeInTheDocument();
    });

    it("offers the link field beside the listed library of a connected source that accepts links", () => {
      sources = [linkSource()];

      render(<LibrarySourceModal provider="youtube" open onOpenChange={vi.fn()} />);

      expect(screen.getByTestId("link-field")).toHaveAttribute("data-connected", "true");
      expect(screen.getByTestId("toolbar-search")).toBeInTheDocument();
      expect(screen.getByTestId("master-table")).toHaveAttribute("data-count", "2");
    });

    it("opens a source that is not connected on the link field, with the connect invitation below it", () => {
      sources = [linkSource({ connected: false })];

      render(<LibrarySourceModal provider="youtube" open onOpenChange={vi.fn()} />);

      expect(screen.getByTestId("topbar")).toBeInTheDocument();
      expect(screen.getByTestId("link-field")).toHaveAttribute("data-connected", "false");
      expect(screen.getByTestId("connect-prompt")).toHaveAttribute("data-source", "youtube");
      expect(screen.queryByTestId("toolbar-search")).not.toBeInTheDocument();
      expect(screen.queryByTestId("master-table")).not.toBeInTheDocument();
      expect(screen.queryByTestId("bottombar")).not.toBeInTheDocument();
      expect(itemsCalls.args.at(-1)).toEqual(["youtube", false]);
    });

    it("lists a playlist loaded from a link while not connected, marks it for import and saves it like a listed one", async () => {
      sources = [linkSource({ connected: false })];
      const onOpenChange = vi.fn();
      render(<LibrarySourceModal provider="youtube" open onOpenChange={onOpenChange} />);

      act(() => {
        linkFieldProps?.onLoaded(
          createMockLibraryItem({ id: "PL9", type: "playlist", name: "Linked", imported: false })
        );
      });

      expect(screen.getByTestId("master-table")).toHaveAttribute("data-ids", "PL9");
      expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-focused", "PL9");
      expect(screen.getByTestId("connect-prompt")).toHaveAttribute("data-inline", "true");
      expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "true");

      await act(async () => {
        await bottombarProps?.onSave();
      });

      const payload = saveMutateAsync.mock.calls[0][0];
      expect(payload.provider).toBe("youtube");
      expect(payload.toImport).toEqual([expect.objectContaining({ id: "PL9", type: "playlist" })]);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("carries the watch choice of a linked playlist into its import", async () => {
      sources = [linkSource({ connected: false })];
      render(<LibrarySourceModal provider="youtube" open onOpenChange={vi.fn()} />);

      const linked = createMockLibraryItem({ id: "PL9", type: "playlist", imported: false });
      act(() => {
        linkFieldProps?.onLoaded(linked);
      });
      act(() => {
        capturedDraft?.setSyncForItems([linked], true);
      });
      await act(async () => {
        await bottombarProps?.onSave();
      });

      expect(saveMutateAsync.mock.calls[0][0].toImport).toEqual([
        expect.objectContaining({ id: "PL9", syncEnabled: true }),
      ]);
    });

    it("puts a linked playlist that is already listed in focus without listing it twice", () => {
      sources = [linkSource()];
      render(<LibrarySourceModal provider="youtube" open onOpenChange={vi.fn()} />);

      act(() => {
        linkFieldProps?.onLoaded(createMockLibraryItem({ id: "a", type: "playlist", name: "Alpha", imported: false }));
      });

      expect(screen.getByTestId("master-table").getAttribute("data-ids")?.split(",").sort()).toEqual(["a", "b"]);
      expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-focused", "a");
      expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "true");
    });

    it("hands a source that needs a connection for links an unconnected field", () => {
      sources = [
        buildSource({
          connected: false,
          capabilities: { ...buildSource().capabilities, playlistLinks: { accepted: true, needsConnection: true } },
        }),
      ];

      render(<LibrarySourceModal provider="spotify" open onOpenChange={vi.fn()} />);

      expect(screen.getByTestId("link-field")).toHaveAttribute("data-connected", "false");
      expect(linkFieldProps?.source.capabilities.playlistLinks.needsConnection).toBe(true);
    });
  });
});
