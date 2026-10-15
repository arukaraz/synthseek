import { beforeEach, describe, expect, it, vi } from "vitest";

import { TOAST_DETAIL_DURATION_MS } from "@components/ui/Toaster/constants";
import type { LibraryFilesStatus, LibraryPathRecord } from "@hooks/api/queries/library/types";
import { act, renderWithProviders, screen } from "@test/test-utils";

import type { LibraryFileRequest } from "../../../types";

interface MutateOptions {
  onSuccess?: (result: { outcome: string }) => void;
}

const auth = vi.hoisted(() => ({ isAdmin: true }));
const mutations = vi.hoisted(() => ({
  move: vi.fn<(input: unknown, options?: MutateOptions) => void>(),
  remove: vi.fn<(input: unknown, options?: MutateOptions) => void>(),
}));
const status = vi.hoisted(() => ({
  data: undefined as LibraryFilesStatus | undefined,
  dataUpdatedAt: 0,
  refresh: vi.fn(),
}));
const toasts = vi.hoisted(() => ({ success: vi.fn(), warning: vi.fn(), error: vi.fn() }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: auth.isAdmin, currentUser: null, isLoading: false }),
}));

vi.mock("@hooks/api/mutations/library/useLibraryFiles", () => ({
  useMoveLibraryFiles: () => ({ mutate: mutations.move, isPending: false }),
  useDeleteLibraryFiles: () => ({ mutate: mutations.remove, isPending: false }),
}));

vi.mock("@hooks/api/queries/useLibraryFiles", () => ({
  useLibraryFilesStatus: () => ({ data: status.data, dataUpdatedAt: status.dataUpdatedAt }),
  useRefreshLibraryAfterFileJob: () => status.refresh,
}));

vi.mock("sonner", () => ({ toast: toasts }));

const ARCHIVE: LibraryPathRecord = {
  id: "archive",
  label: "Archive",
  folder: "/archive",
  fromEnvironment: false,
  enabled: true,
  isDefault: false,
  namingTemplate: "$albumartist/$album/$track $title",
  access: "writable",
  files: 0,
  sizeBytes: 0,
  freeBytes: 50_000_000_000,
  ruleIds: [],
  lastScanAt: null,
  lastScanOutcome: null,
};

vi.mock("../MoveFilesDialog", () => ({
  MoveFilesDialog: ({ onConfirm }: { onConfirm: (path: LibraryPathRecord) => void }) => (
    <button type="button" onClick={() => onConfirm(ARCHIVE)}>
      confirm-move
    </button>
  ),
}));

import { LibraryFileFlow } from "../LibraryFileFlow";

const TRACK_REQUEST: LibraryFileRequest = {
  kind: "delete",
  target: { scope: "track", trackId: "trk-1", title: "Aerodynamic", pathIds: ["music"] },
};

const ALBUM_MOVE: LibraryFileRequest = {
  kind: "move",
  target: { scope: "album", albumId: "alb-1", name: "Discovery", pathIds: ["music"] },
};

const onClose = vi.fn();
const onStarted = vi.fn();

function renderFlow(request: LibraryFileRequest | null) {
  return renderWithProviders(<LibraryFileFlow request={request} onClose={onClose} onStarted={onStarted} />);
}

function answer(mock: typeof mutations.move, outcome: string) {
  const options = mock.mock.calls.at(-1)?.[1];
  act(() => options?.onSuccess?.({ outcome }));
}

describe("LibraryFileFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.isAdmin = true;
    status.data = undefined;
    status.dataUpdatedAt = 0;
  });

  it("renders nothing for a member", () => {
    auth.isAdmin = false;
    renderFlow(TRACK_REQUEST);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks before deleting, and says the file goes to the recycle bin and the song leaves the library and its playlists", () => {
    renderFlow(TRACK_REQUEST);

    expect(screen.getByText("Delete “Aerodynamic”?")).toBeInTheDocument();
    expect(
      screen.getByText("The file moves to the recycle bin and the song leaves the library and any playlist it is in.")
    ).toBeInTheDocument();
    expect(mutations.remove).not.toHaveBeenCalled();
  });

  it("deletes by track id once confirmed and follows the job", async () => {
    const { user } = renderFlow(TRACK_REQUEST);

    await user.click(screen.getByRole("button", { name: "Delete file" }));
    expect(mutations.remove).toHaveBeenCalledWith(
      { selection: { trackIds: ["trk-1"], albumIds: [] } },
      expect.anything()
    );
    expect(onClose).toHaveBeenCalled();

    answer(mutations.remove, "started");

    expect(onStarted).toHaveBeenCalledWith(TRACK_REQUEST);
    expect(await screen.findByText("Moving to the recycle bin")).toBeInTheDocument();
  });

  it("deletes nothing when the confirmation is cancelled", async () => {
    const { user } = renderFlow(TRACK_REQUEST);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mutations.remove).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("moves an album by album id to the chosen path, then shows the progress", async () => {
    const { user } = renderFlow(ALBUM_MOVE);

    await user.click(screen.getByRole("button", { name: "confirm-move" }));
    expect(mutations.move).toHaveBeenCalledWith(
      { selection: { trackIds: [], albumIds: ["alb-1"] }, targetPathId: "archive" },
      expect.anything()
    );

    answer(mutations.move, "started");

    expect(onStarted).toHaveBeenCalledWith(ALBUM_MOVE);
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText("Moving to Archive")).toBeInTheDocument();
  });

  it.each(["busy", "target_unavailable", "nothing_to_do", "not_found"])(
    "keeps the move dialog open and starts nothing when the server answers %s",
    async (outcome) => {
      const { user } = renderFlow(ALBUM_MOVE);

      await user.click(screen.getByRole("button", { name: "confirm-move" }));
      answer(mutations.move, outcome);

      expect(onStarted).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "confirm-move" })).toBeInTheDocument();
      expect(screen.queryByText("Moving to Archive")).toBeNull();
    }
  );

  it("refreshes the library and reports the failures once the job finishes", async () => {
    const view = renderFlow(ALBUM_MOVE);

    await view.user.click(screen.getByRole("button", { name: "confirm-move" }));
    answer(mutations.move, "started");

    status.data = {
      running: false,
      kind: "move",
      targetPathId: "archive",
      total: 3,
      processed: 3,
      done: 2,
      failed: 1,
      startedAt: "2026-10-14T10:00:00.000Z",
      finishedAt: "2026-10-14T10:00:05.000Z",
      failures: [{ title: "Digital Love", reason: "NO_SPACE" }],
    };
    status.dataUpdatedAt = Date.now() + 1000;
    view.rerender(<LibraryFileFlow request={null} onClose={onClose} onStarted={onStarted} />);

    expect(status.refresh).toHaveBeenCalledTimes(1);
    expect(toasts.warning).toHaveBeenCalledWith(
      "Moved 2 of 3 songs to Archive",
      expect.objectContaining({ duration: TOAST_DETAIL_DURATION_MS })
    );
    expect(screen.queryByText("Moving to Archive")).toBeNull();
  });

  it("keeps the default toast length when nothing failed", async () => {
    const view = renderFlow(ALBUM_MOVE);

    await view.user.click(screen.getByRole("button", { name: "confirm-move" }));
    answer(mutations.move, "started");

    status.data = {
      running: false,
      kind: "move",
      targetPathId: "archive",
      total: 3,
      processed: 3,
      done: 3,
      failed: 0,
      startedAt: "2026-10-14T10:00:00.000Z",
      finishedAt: "2026-10-14T10:00:05.000Z",
      failures: [],
    };
    status.dataUpdatedAt = Date.now() + 1000;
    view.rerender(<LibraryFileFlow request={null} onClose={onClose} onStarted={onStarted} />);

    expect(toasts.success).toHaveBeenCalledWith("Moved 3 songs to Archive", {});
  });
});
