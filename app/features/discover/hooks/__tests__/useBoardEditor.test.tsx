import { afterEach, describe, expect, it, vi } from "vitest";

import type { BoardItem, BoardLayout } from "@hooks/api/queries/board/types";
import { createWidget } from "@test/factories";
import { act, fireEvent, renderHook } from "@test/test-utils";

import { customWidgetsById } from "../../components/ExploreBoard/helpers";
import { useBoardEditor } from "../useBoardEditor";

const NO_CUSTOM = customWidgetsById([]);

interface ToastAction {
  label: string;
  onClick: () => void;
}

const { saveMock, toastMock } = vi.hoisted(() => ({
  saveMock: vi.fn<(layout: BoardLayout) => void>(),
  toastMock: { success: vi.fn<(message: string, options?: { action?: ToastAction; duration?: number }) => void>() },
}));
const dropRef = vi.hoisted((): { current: ((order: BoardItem[]) => void) | null } => ({ current: null }));

vi.mock("@hooks/api/mutations/board/useSaveBoardLayout", () => ({ useSaveBoardLayout: () => saveMock }));
vi.mock("sonner", () => ({ toast: toastMock }));
vi.mock("@hooks/ui/board/helpers", () => ({ focusBoardTile: vi.fn() }));
vi.mock("@hooks/ui/board/useBoardDrag", () => ({
  useBoardDrag: ({ onDrop }: { onDrop: (order: BoardItem[]) => void }) => {
    dropRef.current = onDrop;
    return { order: null, draggingId: null, startDrag: vi.fn() };
  },
}));

const ITEMS: BoardItem[] = [
  { kind: "builtin", id: "a", widget: "scrobbles", size: "M" },
  { kind: "builtin", id: "b", widget: "requests", size: "M" },
  { kind: "builtin", id: "c", widget: "mixes", size: "L" },
];

function lastSavedIds(): string[] {
  return saveMock.mock.calls.at(-1)?.[0].items.map((item) => item.id) ?? [];
}

function lastToastAction(): ToastAction {
  const action = toastMock.success.mock.calls.at(-1)?.[1]?.action;
  if (!action) throw new Error("the toast carried no action");
  return action;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useBoardEditor", () => {
  it("moves a tile one step, saves the whole list and announces the new position", () => {
    const { result } = renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));

    act(() => result.current.actions.move("c", -1));

    expect(lastSavedIds()).toEqual(["a", "c", "b"]);
    expect(result.current.announcement).toBe("Discover Mixes moved to position 2 of 3");
  });

  it("keeps a custom tile where it sits and names it after its widget", () => {
    const custom: BoardItem = { kind: "custom", id: "x", widgetId: "w_1", size: "M" };
    const base = createWidget();
    const widgets = customWidgetsById([createWidget({ meta: { ...base.meta, name: "Mine" } })]);
    const { result } = renderHook(() => useBoardEditor([custom, ...ITEMS], widgets, "ready"));

    act(() => result.current.actions.move("x", 1));

    expect(lastSavedIds()).toEqual(["a", "x", "b", "c"]);
    expect(result.current.announcement).toBe("Mine moved to position 2 of 4");
  });

  it("announces a custom tile by a neutral name when its widget list failed to load", () => {
    const custom: BoardItem = { kind: "custom", id: "x", widgetId: "w_1", size: "M" };
    const { result } = renderHook(() => useBoardEditor([custom, ...ITEMS], NO_CUSTOM, "error"));

    act(() => result.current.actions.remove("x"));

    expect(result.current.announcement).toBe("Custom widget removed");
    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Custom widget removed");
  });

  it("does nothing when a tile is moved past either end", () => {
    const { result } = renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));

    act(() => result.current.actions.move("a", -1));
    act(() => result.current.actions.move("c", 1));

    expect(saveMock).not.toHaveBeenCalled();
  });

  it("saves a new size and announces it, but skips the size the tile already has", () => {
    const { result } = renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));

    act(() => result.current.actions.resize("a", "M"));
    expect(saveMock).not.toHaveBeenCalled();

    act(() => result.current.actions.resize("a", "L"));
    expect(saveMock.mock.calls.at(-1)?.[0].items[0]?.size).toBe("L");
    expect(result.current.announcement).toBe("Recent Scrobbles is now Large");
  });

  it("removes a tile with an Undo that saves the previous list back", () => {
    const { result } = renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));

    act(() => result.current.actions.remove("b"));

    expect(lastSavedIds()).toEqual(["a", "c"]);
    expect(result.current.announcement).toBe("Recent requests removed");
    const undo = lastToastAction();
    expect(undo.label).toBe("Undo");

    undo.onClick();

    expect(lastSavedIds()).toEqual(["a", "b", "c"]);
  });

  it("saves a dropped order with an Undo back to the order before the drag", () => {
    renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));
    const dropped = [ITEMS[2], ITEMS[0], ITEMS[1]];

    act(() => dropRef.current?.(dropped));

    expect(lastSavedIds()).toEqual(["c", "a", "b"]);
    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board layout saved");
    lastToastAction().onClick();
    expect(lastSavedIds()).toEqual(["a", "b", "c"]);
  });

  it("appends an added widget at its default size under a free id", () => {
    const { result } = renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));

    act(() => result.current.add("trending"));

    expect(saveMock.mock.calls.at(-1)?.[0].items.at(-1)).toEqual({
      kind: "builtin",
      id: "trending",
      widget: "trending",
      size: "L",
    });
    expect(toastMock.success).toHaveBeenCalledWith("Trending now added at the end");
  });

  it("opens the gallery in edit mode and closes both when editing stops", () => {
    const { result } = renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));

    act(() => result.current.openGallery());
    expect(result.current.editing).toBe(true);
    expect(result.current.galleryOpen).toBe(true);

    act(() => result.current.stopEditing());
    expect(result.current.editing).toBe(false);
    expect(result.current.galleryOpen).toBe(false);
  });

  it("leaves edit mode on Escape only while the gallery is closed", () => {
    const { result } = renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));

    act(() => result.current.openGallery());
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(result.current.editing).toBe(true);

    act(() => result.current.setGalleryOpen(false));
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(result.current.editing).toBe(false);
  });

  it("stays in edit mode when another layer already handled the Escape", () => {
    const { result } = renderHook(() => useBoardEditor(ITEMS, NO_CUSTOM, "ready"));
    const handled = (event: KeyboardEvent) => event.preventDefault();
    document.addEventListener("keydown", handled, { capture: true });

    act(() => result.current.startEditing());
    act(() => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });
    document.removeEventListener("keydown", handled, { capture: true });

    expect(result.current.editing).toBe(true);
  });
});
