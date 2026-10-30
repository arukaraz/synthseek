import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardItem } from "@hooks/api/queries/board/types";
import { DRAG_GHOST_CLASS } from "@hooks/ui/board/constants";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { customWidgetsById } from "../../ExploreBoard/helpers";
import { BoardArrangeDialog } from "../BoardArrangeDialog";

const { size } = vi.hoisted(() => ({ size: { width: 1000, height: 600 } }));

vi.mock("@hooks/ui/useElementWidth", () => ({ useElementWidth: () => [() => undefined, size.width] }));
vi.mock("@hooks/ui/useElementHeight", () => ({ useElementHeight: () => [() => undefined, size.height] }));
vi.mock("../../CustomWidget/CustomWidget", () => ({ CustomWidget: () => <div data-preview="custom" /> }));
vi.mock("../../ExploreBoard/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../ExploreBoard/constants")>();
  const stub = (name: string) =>
    function Stub({ info, size: shown }: { info: string; size: string }) {
      return <div data-preview={name} data-size={shown} data-info={info} />;
    };
  return {
    ...actual,
    BOARD_WIDGETS: {
      ...actual.BOARD_WIDGETS,
      scrobbles: { ...actual.BOARD_WIDGETS.scrobbles, component: stub("scrobbles") },
      requests: { ...actual.BOARD_WIDGETS.requests, component: stub("requests") },
    },
  };
});

const ITEMS: BoardItem[] = [
  { kind: "builtin", id: "a", widget: "scrobbles", size: "M" },
  { kind: "builtin", id: "b", widget: "requests", size: "M" },
];

function renderDialog(items: BoardItem[] = ITEMS, device: "wide" | "narrow" = "wide") {
  const onSave = vi.fn<(next: BoardItem[]) => void>();
  const onClose = vi.fn();
  render(
    <BoardArrangeDialog
      items={items}
      device={device}
      custom={customWidgetsById([])}
      customStatus="ready"
      onSave={onSave}
      onClose={onClose}
    />
  );
  return { onSave, onClose };
}

function tileNamed(name: RegExp): HTMLElement {
  return screen.getByRole("group", { name });
}

beforeEach(() => {
  size.width = 1000;
  size.height = 600;
});

describe("BoardArrangeDialog", () => {
  it("draws every tile of the board at scale, without the widgets' own info", () => {
    renderDialog();

    expect(tileNamed(/^Recent Scrobbles, position 1 of 2/)).toBeInTheDocument();
    expect(tileNamed(/^Recent requests, position 2 of 2/)).toBeInTheDocument();
    expect(document.querySelector("[data-preview='scrobbles']")).toHaveAttribute("data-info", "");
    expect(document.querySelector("[data-preview='scrobbles']")?.closest("[inert]")).not.toBeNull();
  });

  it("keeps Save off until something changes, and saves the whole new board once", () => {
    const { onSave, onClose } = renderDialog();
    const save = screen.getByRole("button", { name: "Save changes" });
    expect(save).toBeDisabled();

    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));
    fireEvent.keyDown(tileNamed(/^Recent Scrobbles/), { key: "ArrowRight" });
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith([
      expect.objectContaining({ id: "b", size: "L" }),
      expect.objectContaining({ id: "a", size: "M" }),
    ]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("removes a tile from the draft and says so when the board would end up empty", () => {
    const { onSave } = renderDialog([ITEMS[0]]);

    fireEvent.click(screen.getByRole("button", { name: "Remove Recent Scrobbles" }));
    expect(screen.getByText("Your board will be empty.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSave).toHaveBeenCalledWith([]);
  });

  it("closes a clean dialog without asking", () => {
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();
  });

  it("asks before throwing changes away, from Cancel and from the close button alike", () => {
    const { onClose, onSave } = renderDialog();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Keep arranging" }));
    expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("offers no sizes on a narrow board, where every tile shows at one size", () => {
    renderDialog(ITEMS, "narrow");

    expect(screen.queryByRole("group", { name: "Size of Recent Scrobbles" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Recent Scrobbles" })).toBeInTheDocument();
  });

  it("starts a drag from a mouse press on the tile but not from its buttons", () => {
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    renderDialog();
    const tile = tileNamed(/^Recent Scrobbles/);
    const ghosts = () => Array.from(document.body.children).filter((node) => node.className.includes(DRAG_GHOST_CLASS));

    fireEvent.pointerDown(within(tile).getByRole("button", { name: "Large" }), { pointerType: "mouse", button: 0 });
    expect(ghosts()).toHaveLength(0);

    fireEvent.pointerDown(tile, { pointerType: "mouse", button: 0 });
    expect(ghosts()).toHaveLength(1);
  });
});
