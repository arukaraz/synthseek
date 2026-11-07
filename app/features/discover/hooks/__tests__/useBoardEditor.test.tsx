import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  BoardAppearance,
  BoardItem,
  BoardLayout,
  BoardList,
  BoardLists,
  BoardTemplateUndo,
} from "@hooks/api/queries/board/types";
import { createWidget } from "@test/factories";
import { act, fireEvent, renderHook } from "@test/test-utils";

import { customWidgetsById } from "../../components/ExploreBoard/helpers";
import type { BoardCustomWidgets, CustomWidgetsStatus } from "../../components/ExploreBoard/types";
import { useBoardEditor } from "../useBoardEditor";

const NO_CUSTOM = customWidgetsById([]);

interface ToastAction {
  label: string;
  onClick: () => void;
}

const { saveMock, appearanceMock, toastMock, undoMock } = vi.hoisted(() => ({
  saveMock: vi.fn<(layout: BoardLayout) => void>(),
  appearanceMock: vi.fn<(appearance: BoardAppearance) => void>(),
  undoMock: vi.fn<(undo: BoardTemplateUndo, options?: { onSuccess?: () => void }) => void>(),
  toastMock: { success: vi.fn<(message: string, options?: { action?: ToastAction; duration?: number }) => void>() },
}));
const dropRef = vi.hoisted((): { current: ((order: BoardItem[]) => void) | null } => ({ current: null }));

vi.mock("@hooks/api/mutations/board/useSaveBoardLayout", () => ({ useSaveBoardLayout: () => saveMock }));
vi.mock("@hooks/api/mutations/board/useSetBoardAppearance", () => ({ useSetBoardAppearance: () => appearanceMock }));
vi.mock("@hooks/api/mutations/board/useUndoBoardTemplate", () => ({
  useUndoBoardTemplate: () => ({ mutate: undoMock }),
}));
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
const MOBILE: BoardItem[] = [
  { kind: "builtin", id: "m", widget: "genres", size: "S" },
  { kind: "builtin", id: "a", widget: "scrobbles", size: "M" },
];

function editor(
  items: BoardItem[] = ITEMS,
  {
    list = "items",
    mobile = MOBILE,
    custom = NO_CUSTOM,
    status = "ready",
  }: { list?: BoardList; mobile?: BoardItem[]; custom?: BoardCustomWidgets; status?: CustomWidgetsStatus } = {}
) {
  const lists: BoardLists = { items, mobile };
  return renderHook(() => useBoardEditor(lists, list, custom, status));
}

function lastSaved(): BoardLayout {
  const layout = saveMock.mock.calls.at(-1)?.[0];
  if (!layout) throw new Error("nothing was saved");
  return layout;
}

function lastSavedIds(list: BoardList = "items"): string[] {
  return lastSaved()[list].map((item) => item.id);
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
    const { result } = editor();

    act(() => result.current.actions.move("c", -1));

    expect(lastSavedIds()).toEqual(["a", "c", "b"]);
    expect(result.current.announcement).toBe("Discover Mixes moved to position 2 of 3");
  });

  it("edits only the arrangement it was given and saves the other one as it was", () => {
    const { result } = editor(ITEMS, { list: "mobile" });

    act(() => result.current.actions.move("a", -1));

    expect(lastSaved()).toEqual({ schemaVersion: 4, items: ITEMS, mobile: [MOBILE[1], MOBILE[0]] });
    expect(result.current.displayItems).toEqual(MOBILE);
  });

  it("keeps a custom tile where it sits and names it after its widget", () => {
    const custom: BoardItem = { kind: "custom", id: "x", widgetId: "w_1", size: "M" };
    const base = createWidget();
    const widgets = customWidgetsById([createWidget({ meta: { ...base.meta, name: "Mine" } })]);
    const { result } = editor([custom, ...ITEMS], { custom: widgets });

    act(() => result.current.actions.move("x", 1));

    expect(lastSavedIds()).toEqual(["a", "x", "b", "c"]);
    expect(result.current.announcement).toBe("Mine moved to position 2 of 4");
  });

  it("announces a custom tile by a neutral name when its widget list failed to load", () => {
    const custom: BoardItem = { kind: "custom", id: "x", widgetId: "w_1", size: "M" };
    const { result } = editor([custom, ...ITEMS], { status: "error" });

    act(() => result.current.actions.remove("x"));

    expect(result.current.announcement).toBe("Custom widget removed");
    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Custom widget removed");
  });

  it("does nothing when a tile is moved past either end", () => {
    const { result } = editor();

    act(() => result.current.actions.move("a", -1));
    act(() => result.current.actions.move("c", 1));

    expect(saveMock).not.toHaveBeenCalled();
  });

  it("saves a new size and announces it, but skips the size the tile already has", () => {
    const { result } = editor();

    act(() => result.current.actions.resize("a", "M"));
    expect(saveMock).not.toHaveBeenCalled();

    act(() => result.current.actions.resize("a", "L"));
    expect(lastSaved().items[0]?.size).toBe("L");
    expect(result.current.announcement).toBe("Recent Scrobbles is now Large");
  });

  it("removes a tile with an Undo that saves the previous list back", () => {
    const { result } = editor();

    act(() => result.current.actions.remove("b"));

    expect(lastSavedIds()).toEqual(["a", "c"]);
    expect(result.current.announcement).toBe("Recent requests removed");
    const undo = lastToastAction();
    expect(undo.label).toBe("Undo");

    undo.onClick();

    expect(lastSavedIds()).toEqual(["a", "b", "c"]);
  });

  it("adds a spacer to the arrangement being edited", () => {
    const { result } = editor(ITEMS, { list: "mobile" });

    act(() => result.current.addSpacer());

    expect(lastSaved().items).toEqual(ITEMS);
    expect(lastSaved().mobile.at(-1)?.kind).toBe("spacer");
  });

  it("offers to undo an applied template with what the server handed back, and confirms once it is undone", () => {
    const { result } = editor();
    const undo: BoardTemplateUndo = {
      layout: null,
      appearance: { density: "comfortable", text: "default" },
      widgetIds: ["w_new"],
    };

    act(() =>
      result.current.templateApplied({
        layout: { schemaVersion: 4, items: [], mobile: [] },
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

  it("saves a dropped order with an Undo back to the order before the drag", () => {
    editor();
    const dropped = [ITEMS[2], ITEMS[0], ITEMS[1]];

    act(() => dropRef.current?.(dropped));

    expect(lastSavedIds()).toEqual(["c", "a", "b"]);
    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board layout saved");
    lastToastAction().onClick();
    expect(lastSavedIds()).toEqual(["a", "b", "c"]);
  });

  it("opens Board Customization on the section asked for, in edit mode", () => {
    const { result } = editor();

    act(() => result.current.openCustomization("board"));

    expect(result.current.editing).toBe(true);
    expect(result.current.customization).toEqual({ section: "board", target: null, boardWidth: 0 });
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("saves both arranged lists once, closes the modal and offers to undo back to the board it replaced", () => {
    const { result } = editor();
    act(() => result.current.openCustomization("board"));
    const next: BoardLists = { items: [ITEMS[1], ITEMS[0]], mobile: [MOBILE[0]] };

    act(() => result.current.saveCustomization({ lists: next, appearance: null }));

    expect(result.current.customization).toBeNull();
    expect(saveMock.mock.calls).toEqual([[{ schemaVersion: 4, ...next }]]);
    expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board saved");
    expect(appearanceMock).not.toHaveBeenCalled();
    lastToastAction().onClick();
    expect(lastSaved()).toEqual({ schemaVersion: 4, items: ITEMS, mobile: MOBILE });
    expect(appearanceMock).not.toHaveBeenCalled();
  });

  it("saves a new look alone and undoes it back to the look it replaced", () => {
    const { result } = editor();
    const previous: BoardAppearance = { density: "comfortable", text: "default" };
    const next: BoardAppearance = { density: "compact", text: "large" };

    act(() => result.current.saveCustomization({ lists: null, appearance: { next, previous } }));

    expect(saveMock).not.toHaveBeenCalled();
    expect(appearanceMock.mock.calls).toEqual([[next]]);
    lastToastAction().onClick();
    expect(appearanceMock.mock.calls.at(-1)).toEqual([previous]);
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("closes without saving or offering an undo when nothing changed", () => {
    const { result } = editor();
    act(() => result.current.openCustomization("board"));

    act(() => result.current.saveCustomization({ lists: null, appearance: null }));

    expect(result.current.customization).toBeNull();
    expect(saveMock).not.toHaveBeenCalled();
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it("opens the widgets section on the widget a tile asked to edit, and forgets it once closed", () => {
    const { result } = editor();

    act(() => result.current.actions.edit("w_1"));
    expect(result.current.customization).toMatchObject({
      section: "widgets",
      target: { kind: "custom", widgetId: "w_1" },
    });

    act(() => result.current.closeCustomization());
    expect(result.current.customization).toBeNull();
    expect(result.current.editing).toBe(true);
  });

  it("opens the widgets section on the built-in widget a tile asked to customize", () => {
    const { result } = editor();

    act(() => result.current.actions.customize("trending"));

    expect(result.current.customization?.target).toEqual({ kind: "builtin", widget: "trending" });
  });

  it("closes Board Customization when editing stops", () => {
    const { result } = editor();
    act(() => result.current.openCustomization("widgets"));

    act(() => result.current.stopEditing());

    expect(result.current.editing).toBe(false);
    expect(result.current.customization).toBeNull();
  });

  it("leaves edit mode on Escape only while Board Customization is closed", () => {
    const { result } = editor();

    act(() => result.current.openCustomization("board"));
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(result.current.editing).toBe(true);

    act(() => result.current.closeCustomization());
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(result.current.editing).toBe(false);
  });

  it("stays in edit mode when another layer already handled the Escape", () => {
    const { result } = editor();
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
