import { describe, expect, it, vi } from "vitest";

import type { BoardItem, BoardLists, BoardTemplatePreview } from "@hooks/api/queries/board/types";
import { createWidget } from "@test/factories";
import { act, renderHook } from "@test/test-utils";

import { customWidgetsById } from "../../components/ExploreBoard/helpers";
import { useCustomizationDraft } from "../useCustomizationDraft";

vi.mock("@hooks/ui/board/helpers", () => ({ focusBoardTile: vi.fn() }));
vi.mock("@hooks/ui/board/useBoardDrag", () => ({
  useBoardDrag: () => ({ order: null, draggingId: null, startDrag: vi.fn() }),
}));

const MIX_WIDGET = createWidget({ id: "w_mix", view: { ...createWidget().view, block: "mix" } });

const LISTS: BoardLists = { items: [{ kind: "builtin", id: "a", widget: "scrobbles", size: "M" }], mobile: [] };
const NO_CUSTOM = customWidgetsById([]);

function readable(items: BoardItem[], mobile: BoardItem[]): Extract<BoardTemplatePreview, { ok: true }> {
  return {
    ok: true,
    name: "Crates",
    description: "",
    appearance: { density: "spacious", text: "small" },
    tiles: items.length,
    mobileTiles: mobile.length,
    widgets: 1,
    skippedItems: [],
    rejectedWidgets: [],
    needs: [],
    blocked: null,
    layout: { items, mobile },
    documents: [MIX_WIDGET],
  };
}

describe("useCustomizationDraft", () => {
  it("reads a staged template's locked tiles at their only size, so the preview is the board Save produces", () => {
    const { result } = renderHook(() => useCustomizationDraft({ lists: LISTS, custom: NO_CUSTOM }));
    const template = readable(
      [
        { kind: "builtin", id: "t1", widget: "onRepeat", size: "L" },
        { kind: "custom", id: "t2", widgetId: "w_mix", size: "M" },
      ],
      [{ kind: "custom", id: "t3", widgetId: "w_mix", size: "L" }]
    );

    act(() => result.current.stage({ json: "{}", template }));

    expect(result.current.draft.items.map((item) => item.size)).toEqual(["S", "S"]);
    expect(result.current.draft.mobile.map((item) => item.size)).toEqual(["S"]);
  });
});
