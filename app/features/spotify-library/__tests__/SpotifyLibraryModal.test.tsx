import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import type { LibraryItem } from "../types";
import type { LibraryDraft } from "../hooks/useLibraryDraftState";
import { createMockLibraryItem } from "@test/mocks/feature-hooks.mock";

const saveMutateAsync = vi.fn().mockResolvedValue(undefined);
const refetch = vi.fn().mockResolvedValue(undefined);
const invalidateConnectionStatus = vi.fn();

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
}));

let connectionStatus: {
  data: { connected: boolean; pending: boolean } | undefined;
  isLoading: boolean;
};
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

vi.mock("@hooks/api/queries/spotify/useSpotifyConnectionStatus", () => ({
  useSpotifyConnectionStatus: () => connectionStatus,
}));

vi.mock("@hooks/api/queries/spotify/useSpotifyLibraryItems", () => ({
  useSpotifyLibraryItems: () => libraryItems,
}));

vi.mock("@hooks/api/queries/spotify/useInvalidateSpotifyConnectionStatus", () => ({
  useInvalidateSpotifyConnectionStatus: () => invalidateConnectionStatus,
}));

vi.mock("@hooks/api/queries/spotify/useLibrarySubscription", () => ({
  useLibrarySubscription: () => ({ data: subscriptionData }),
}));

vi.mock("@hooks/api/mutations/spotify/useSaveLibraryChanges", () => ({
  useSaveLibraryChanges: () => ({ mutateAsync: saveMutateAsync, isPending: savePending }),
}));

interface BottombarCapture {
  onSave: () => void;
  onCancel: () => void;
  onBulkSync: (enabled: boolean) => void;
  onBulkImport: (enabled: boolean) => void;
  onClearSelection: () => void;
  onWatchChange: (next: Partial<{ playlists: boolean; savedAlbums: boolean }>) => void;
  onRefresh: () => void;
  hasChanges: boolean;
  isSaving: boolean;
  isRefreshing: boolean;
  totalRows: number;
  totalTracks: number;
  selectedCount: number;
}

let bottombarProps: BottombarCapture | null = null;
let capturedDraft: LibraryDraft | null = null;

vi.mock("../components/ModalTopbar", () => ({
  ModalTopbar: () => <div data-testid="topbar" />,
}));

vi.mock("../components/ModalToolbar", () => ({
  ModalToolbar: (props: { onSearchChange: (value: string) => void }) => (
    <button type="button" data-testid="toolbar-search" onClick={() => props.onSearchChange("alpha")}>
      search
    </button>
  ),
}));

vi.mock("../components/MasterTable", () => ({
  MasterTable: (props: { items: LibraryItem[]; draft: LibraryDraft }) => {
    capturedDraft = props.draft;
    return <div data-testid="master-table" data-count={props.items.length} />;
  },
}));

vi.mock("../components/DetailPanel", () => ({
  DetailPanel: (props: { focusedItem: LibraryItem | null }) => (
    <div data-testid="detail-panel" data-focused={props.focusedItem?.id ?? "none"} />
  ),
}));

vi.mock("../components/ModalBottombar", () => ({
  ModalBottombar: (props: BottombarCapture) => {
    bottombarProps = props;
    return <div data-testid="bottombar" data-haschanges={String(props.hasChanges)} />;
  },
}));

vi.mock("../components/SpotifyConnectPrompt", () => ({
  SpotifyConnectPrompt: (props: { pending: boolean; statusLoading: boolean; expired?: boolean }) => (
    <div
      data-testid="connect-prompt"
      data-pending={String(props.pending)}
      data-loading={String(props.statusLoading)}
      data-expired={String(Boolean(props.expired))}
    />
  ),
}));

import { render, screen, act } from "@testing-library/react";
import { SpotifyLibraryModal } from "../SpotifyLibraryModal";

function resetState() {
  connectionStatus = { data: { connected: true, pending: false }, isLoading: false };
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
  capturedDraft = null;
}

describe("SpotifyLibraryModal", () => {
  beforeEach(() => {
    resetState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the connected layout when the account is connected", () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("topbar")).toBeInTheDocument();
    expect(screen.getByTestId("master-table")).toHaveAttribute("data-count", "2");
    expect(screen.getByTestId("bottombar")).toBeInTheDocument();
  });

  it("renders the connect prompt when not connected", () => {
    connectionStatus = { data: { connected: false, pending: true }, isLoading: false };

    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    const prompt = screen.getByTestId("connect-prompt");
    expect(prompt).toHaveAttribute("data-pending", "true");
    expect(screen.queryByTestId("topbar")).not.toBeInTheDocument();
  });

  it("passes loading state to the connect prompt while the status resolves", () => {
    connectionStatus = { data: undefined, isLoading: true };

    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("connect-prompt")).toHaveAttribute("data-loading", "true");
  });

  it("reports no changes for an untouched draft", () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "false");
  });

  it("flags changes once a watch toggle differs from the subscription", () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    act(() => {
      bottombarProps?.onWatchChange({ playlists: true });
    });

    expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "true");
  });

  it("flags changes after a bulk import override and saves the imports", async () => {
    const onOpenChange = vi.fn();
    render(<SpotifyLibraryModal open onOpenChange={onOpenChange} />);

    act(() => {
      capturedDraft?.toggleSelect("a");
    });
    act(() => {
      bottombarProps?.onBulkImport(true);
    });
    expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "true");

    await act(async () => {
      await bottombarProps?.onSave();
    });

    expect(saveMutateAsync).toHaveBeenCalledTimes(1);
    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.toImport[0]).toMatchObject({ id: "a", type: "playlist" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("includes a sync toggle for already imported items on save", async () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    act(() => {
      capturedDraft?.toggleSelect("a");
      capturedDraft?.toggleSelect("b");
    });
    act(() => {
      bottombarProps?.onBulkSync(true);
    });

    await act(async () => {
      await bottombarProps?.onSave();
    });

    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.toToggleSync).toEqual([{ localId: "loc-b", syncEnabled: true }]);
    expect(payload.toImport).toHaveLength(0);
  });

  it("carries the sync intent into the import payload when both overrides are set", async () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    act(() => {
      capturedDraft?.toggleSelect("a");
    });
    act(() => {
      bottombarProps?.onBulkImport(true);
      bottombarProps?.onBulkSync(true);
    });

    await act(async () => {
      await bottombarProps?.onSave();
    });

    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.toImport[0]).toMatchObject({ id: "a", type: "playlist", syncEnabled: true });
  });

  it("sends the subscription block only when the watch flags change", async () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    act(() => {
      bottombarProps?.onWatchChange({ savedAlbums: true });
    });

    await act(async () => {
      await bottombarProps?.onSave();
    });

    const payload = saveMutateAsync.mock.calls[0][0];
    expect(payload.subscription).toEqual({ watch_new_playlists: false, watch_saved_albums: true });
  });

  it("omits the subscription block when the watch flags are unchanged", async () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    await act(async () => {
      await bottombarProps?.onSave();
    });

    expect(saveMutateAsync.mock.calls[0][0].subscription).toBeUndefined();
  });

  it("refetches the library on refresh", () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    act(() => {
      bottombarProps?.onRefresh();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("closes the modal on cancel", () => {
    const onOpenChange = vi.fn();
    render(<SpotifyLibraryModal open onOpenChange={onOpenChange} />);

    act(() => {
      bottombarProps?.onCancel();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("derives the initial watch state from the subscription", () => {
    subscriptionData = { watch_new_playlists: true, watch_saved_albums: false };

    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("bottombar")).toHaveAttribute("data-haschanges", "false");
  });

  it("navigates rows with the keyboard and toggles selection with space", () => {
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

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
    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

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

    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    });

    expect(screen.getByTestId("detail-panel")).toHaveAttribute("data-focused", "none");
  });

  it("does not register keyboard handlers when closed", () => {
    render(<SpotifyLibraryModal open={false} onOpenChange={vi.fn()} />);

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

    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

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

    const { rerender } = render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);
    rerender(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    expect(toastMocks.error).toHaveBeenCalledTimes(1);
    expect(toastMocks.error).toHaveBeenCalledWith("Spotify connection expired", expect.anything());
    expect(invalidateConnectionStatus).toHaveBeenCalledTimes(1);
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

    render(<SpotifyLibraryModal open onOpenChange={vi.fn()} />);

    expect(screen.getByTestId("topbar")).toBeInTheDocument();
    expect(screen.queryByTestId("connect-prompt")).not.toBeInTheDocument();
    expect(toastMocks.error).toHaveBeenCalledTimes(1);
    expect(toastMocks.error).toHaveBeenCalledWith("Could not load your Spotify library", expect.anything());
    expect(invalidateConnectionStatus).not.toHaveBeenCalled();
  });
});
