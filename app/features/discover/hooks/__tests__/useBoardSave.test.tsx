import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  BoardAppearance,
  BoardItem,
  BoardLayout,
  BoardLists,
  BoardTemplateApplied,
  BoardTemplateUndo,
} from "@hooks/api/queries/board/types";
import { act, renderHook } from "@test/test-utils";

import { useBoardSave } from "../useBoardSave";

interface ToastAction {
  label: string;
  onClick: () => void;
}

const { saveMock, appearanceMock, toastMock, undoMock } = vi.hoisted(() => ({
  saveMock: vi.fn<(layout: BoardLayout) => Promise<boolean>>(() => Promise.resolve(true)),
  appearanceMock: vi.fn<(appearance: BoardAppearance) => Promise<boolean>>(() => Promise.resolve(true)),
  undoMock: vi.fn<(undo: BoardTemplateUndo, options?: { onSuccess?: () => void }) => void>(),
  toastMock: { success: vi.fn<(message: string, options?: { action?: ToastAction; duration?: number }) => void>() },
}));

vi.mock("@hooks/api/mutations/board/useSaveBoardLayout", () => ({ useSaveBoardLayout: () => saveMock }));
vi.mock("@hooks/api/mutations/board/useSetBoardAppearance", () => ({ useSetBoardAppearance: () => appearanceMock }));
vi.mock("@hooks/api/mutations/board/useUndoBoardTemplate", () => ({
  useUndoBoardTemplate: () => ({ mutate: undoMock }),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const ITEMS: BoardItem[] = [
  { kind: "builtin", id: "a", widget: "scrobbles", size: "M" },
  { kind: "builtin", id: "b", widget: "requests", size: "M" },
];
const MOBILE: BoardItem[] = [{ kind: "builtin", id: "m", widget: "genres", size: "S" }];
const LISTS: BoardLists = { items: ITEMS, mobile: MOBILE };

function lastToastAction(): ToastAction {
  const action = toastMock.success.mock.calls.at(-1)?.[1]?.action;
  if (!action) throw new Error("the toast carried no action");
  return action;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useBoardSave", () => {
  it("saves both lists once and offers to undo back to the board it replaced", () => {
    const { result } = renderHook(() => useBoardSave(LISTS));
    const next: BoardLists = { items: [ITEMS[1], ITEMS[0]], mobile: [] };

    act(() => void result.current.saveChanges({ lists: next, appearance: null }));

    expect(saveMock.mock.calls).toEqual([[{ schemaVersion: 5, ...next }, "optimistic"]]);
    expect(appearanceMock).not.toHaveBeenCalled();
    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board saved");
    lastToastAction().onClick();
    expect(saveMock.mock.calls.at(-1)).toEqual([{ schemaVersion: 5, items: ITEMS, mobile: MOBILE }]);
  });

  it("saves a new look alone and undoes it back to the look it replaced", () => {
    const { result } = renderHook(() => useBoardSave(LISTS));
    const previous: BoardAppearance = { density: "comfortable", text: "default" };
    const next: BoardAppearance = { density: "compact", text: "large" };

    act(() => void result.current.saveChanges({ lists: null, appearance: { next, previous } }));

    expect(saveMock).not.toHaveBeenCalled();
    expect(appearanceMock.mock.calls).toEqual([[next, "optimistic"]]);
    lastToastAction().onClick();
    expect(appearanceMock.mock.calls.at(-1)).toEqual([previous]);
  });

  it("resolves true only once every write the save made has been kept", async () => {
    const { result } = renderHook(() => useBoardSave(LISTS));
    const next: BoardLists = { items: [ITEMS[1], ITEMS[0]], mobile: [] };
    const compact: BoardAppearance = { density: "compact", text: "large" };
    const comfortable: BoardAppearance = { density: "comfortable", text: "default" };
    const look = { next: compact, previous: comfortable };

    await expect(result.current.saveChanges({ lists: next, appearance: look })).resolves.toBe(true);
    appearanceMock.mockResolvedValueOnce(false);
    await expect(result.current.saveChanges({ lists: next, appearance: look })).resolves.toBe(false);
  });

  it("offers the undo of a confirmed save only once the server has kept it, and none when it refuses", async () => {
    const { result } = renderHook(() => useBoardSave(LISTS));
    const next: BoardLists = { items: [ITEMS[1], ITEMS[0]], mobile: [] };

    saveMock.mockResolvedValueOnce(false);
    await expect(result.current.saveChanges({ lists: next, appearance: null }, "confirmed")).resolves.toBe(false);
    expect(saveMock.mock.calls).toEqual([[{ schemaVersion: 5, ...next }, "confirmed"]]);
    expect(toastMock.success).not.toHaveBeenCalled();

    await expect(result.current.saveChanges({ lists: next, appearance: null }, "confirmed")).resolves.toBe(true);
    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board saved");
  });

  it("saves nothing and offers no undo when nothing changed", () => {
    const { result } = renderHook(() => useBoardSave(LISTS));

    act(() => void result.current.saveChanges({ lists: null, appearance: null }));

    expect(saveMock).not.toHaveBeenCalled();
    expect(appearanceMock).not.toHaveBeenCalled();
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it("offers to undo an applied template with what the server handed back, and confirms once it is undone", () => {
    const { result } = renderHook(() => useBoardSave(LISTS));
    const undo: BoardTemplateApplied["undo"] = {
      layout: null,
      appearance: { density: "comfortable", text: "default" },
      widgetIds: ["w_new"],
    };

    act(() =>
      result.current.templateApplied({
        layout: { schemaVersion: 5, items: [], mobile: [] },
        appearance: { density: "compact", text: "large" },
        undo,
      })
    );

    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board template applied");
    lastToastAction().onClick();
    expect(undoMock).toHaveBeenCalledWith(undo, expect.anything());
    undoMock.mock.calls.at(-1)?.[1]?.onSuccess?.();
    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board restored");
  });
});
