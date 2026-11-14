import { describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@components/ui/Tooltip";
import type { BoardItem } from "@hooks/api/queries/board/types";
import { createWidgetPreset } from "@test/factories";
import { fireEvent, render, screen, waitFor } from "@test/test-utils";

import { BoardTileEditControls } from "../BoardTileEditControls";
import { customWidgetsById } from "../helpers";
import type { BoardTileActions } from "../types";

vi.mock("@hooks/api/queries/widgets/useWidgetPresets", () => ({
  useWidgetPresets: () => ({ data: [createWidgetPreset({ key: "trending", builtin: "trending" })] }),
}));

function actions(): BoardTileActions {
  return {
    move: vi.fn(),
    moveToEdge: vi.fn(),
    resize: vi.fn(),
    resizeSpacer: vi.fn(),
    toggleBackground: vi.fn(),
    remove: vi.fn(),
    startDrag: vi.fn(),
    customize: vi.fn(),
    edit: vi.fn(),
  };
}

const ITEM: BoardItem = { kind: "builtin", id: "t", widget: "trending", size: "L" };

const NO_CUSTOM = customWidgetsById([]);

const SPACER: BoardItem = { kind: "spacer", id: "s", size: "S", rows: 4 };

function renderControls(item: BoardItem, handlers = actions(), position = 2, total = 3, rowSized = false) {
  return render(
    <BoardTileEditControls
      item={item}
      device="wide"
      name="Tile"
      editable={item.kind === "custom"}
      rowSized={rowSized}
      position={position}
      total={total}
      actions={handlers}
      custom={NO_CUSTOM}
    />
  );
}

async function openSettings(): Promise<void> {
  fireEvent.pointerDown(screen.getByRole("button", { name: "Settings for Tile" }), { button: 0, ctrlKey: false });
  await screen.findByRole("menu");
}

function menuItem(name: string): HTMLElement {
  return screen.getByRole("menuitem", { name });
}

function barButtons(): (string | null)[] {
  return screen.getAllByRole("button").map((button) => button.getAttribute("aria-label") ?? button.textContent);
}

describe("BoardTileEditControls", () => {
  it("leaves the drag handle, the sizes, the settings and the remove button on the bar, and the title beside them", () => {
    renderControls(ITEM);

    expect(barButtons()).toEqual([
      "Drag Tile",
      "Small",
      "Medium",
      "Large",
      "Extra large",
      "Settings for Tile",
      "Remove Tile",
    ]);
    expect(screen.getByText("Tile")).toBeInTheDocument();
  });

  it("locks a history mix to its only size, keeping the other chips visible but inert", () => {
    const handlers = actions();
    render(
      <TooltipProvider>
        <BoardTileEditControls
          item={{ kind: "builtin", id: "o", widget: "onRepeat", size: "S" }}
          device="wide"
          name="Tile"
          editable={false}
          rowSized
          position={1}
          total={1}
          actions={handlers}
          custom={NO_CUSTOM}
        />
      </TooltipProvider>
    );

    const locked = screen.getAllByRole("button", { name: /Medium|Large|Extra large/ });
    expect(locked).toHaveLength(3);
    for (const chip of locked) {
      expect(chip).toHaveAttribute("aria-disabled", "true");
      fireEvent.click(chip);
    }
    expect(handlers.resize).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Small" }));
    expect(handlers.resize).toHaveBeenCalledWith("o", "S");
  });

  it("moves the tile one step and to either end from the settings menu", async () => {
    const handlers = actions();
    renderControls(ITEM, handlers);

    await openSettings();
    fireEvent.click(menuItem("Move earlier"));
    await openSettings();
    fireEvent.click(menuItem("Move later"));
    await openSettings();
    fireEvent.click(menuItem("Move to top"));
    await openSettings();
    fireEvent.click(menuItem("Move to bottom"));

    expect(handlers.move).toHaveBeenNthCalledWith(1, "t", -1);
    expect(handlers.move).toHaveBeenNthCalledWith(2, "t", 1);
    expect(handlers.moveToEdge).toHaveBeenNthCalledWith(1, "t", "top");
    expect(handlers.moveToEdge).toHaveBeenNthCalledWith(2, "t", "bottom");
  });

  it("offers the step moves on a small tile too, now that they take no room on its bar", async () => {
    renderControls({ ...ITEM, size: "S" });

    await openSettings();

    expect(menuItem("Move earlier")).toBeInTheDocument();
  });

  it("disables every move past the end of the board", async () => {
    renderControls(ITEM, actions(), 1, 1);

    await openSettings();

    for (const name of ["Move earlier", "Move later", "Move to top", "Move to bottom"]) {
      expect(menuItem(name)).toHaveAttribute("aria-disabled", "true");
    }
  });

  it("toggles the tile's background and stays open, so the new label can be read", async () => {
    const handlers = actions();
    renderControls({ ...ITEM, background: false }, handlers);

    await openSettings();
    fireEvent.click(menuItem("Show background"));

    expect(handlers.toggleBackground).toHaveBeenCalledWith("t");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("offers to hide a background that shows", async () => {
    renderControls(ITEM);

    await openSettings();

    expect(menuItem("Hide background")).toBeInTheDocument();
  });

  it("offers a spacer its height, staying open between steps, and no widget the same", async () => {
    const handlers = actions();
    const { unmount } = renderControls(SPACER, handlers);

    await openSettings();
    fireEvent.click(menuItem("Make the spacer shorter"));
    fireEvent.click(menuItem("Make the spacer taller"));

    expect(handlers.resizeSpacer).toHaveBeenNthCalledWith(1, "s", -1);
    expect(handlers.resizeSpacer).toHaveBeenNthCalledWith(2, "s", 1);

    unmount();
    renderControls(ITEM);
    await openSettings();
    expect(screen.queryByRole("menuitem", { name: "Make the spacer shorter" })).toBeNull();
  });

  it("offers a spacer beside a widget no height of its own, and says its row sets it", async () => {
    const handlers = actions();
    renderControls(SPACER, handlers, 2, 3, true);

    await openSettings();

    expect(screen.queryByRole("menuitem", { name: "Make the spacer shorter" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Make the spacer taller" })).toBeNull();
    expect(menuItem("As tall as its row. Set the height on the row.")).toHaveAttribute("aria-disabled", "true");
  });

  it("stops a spacer at its shortest", async () => {
    renderControls({ ...SPACER, rows: 1 });

    await openSettings();

    expect(menuItem("Make the spacer shorter")).toHaveAttribute("aria-disabled", "true");
  });

  it("marks the current size and resizes to the chip that is pressed", () => {
    const handlers = actions();
    renderControls(ITEM, handlers);

    expect(screen.getByRole("button", { name: "Large" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Extra large" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Medium" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "Medium" }));

    expect(handlers.resize).toHaveBeenCalledWith("t", "M");
  });

  it.each<[string, BoardItem]>([
    ["a builtin", { kind: "builtin", id: "o", widget: "trending", size: "S" }],
    ["a custom", { kind: "custom", id: "c", widgetId: "w_1", size: "S" }],
  ])(
    "offers %s tile every size on both a wide and a narrow board, since each arrangement keeps its own sizes",
    (_kind, item) => {
      const { rerender } = render(
        <BoardTileEditControls
          item={item}
          device="wide"
          name="Mine"
          editable
          rowSized
          position={1}
          total={1}
          actions={actions()}
          custom={NO_CUSTOM}
        />
      );
      const group = screen.getByRole("group", { name: "Size of Mine" });
      expect(Array.from(group.querySelectorAll("button"), (button) => button.textContent)).toEqual([
        "S",
        "M",
        "L",
        "XL",
      ]);

      rerender(
        <BoardTileEditControls
          item={item}
          device="narrow"
          name="Mine"
          editable
          rowSized
          position={1}
          total={1}
          actions={actions()}
          custom={NO_CUSTOM}
        />
      );
      const narrow = screen.getByRole("group", { name: "Size of Mine" });
      expect(Array.from(narrow.querySelectorAll("button"), (button) => button.textContent)).toEqual([
        "S",
        "M",
        "L",
        "XL",
      ]);
      expect(screen.getByRole("button", { name: "Remove Mine" })).toBeInTheDocument();
    }
  );

  it("removes the tile and starts a drag from the handle", () => {
    const handlers = actions();
    renderControls(ITEM, handlers);

    fireEvent.click(screen.getByRole("button", { name: "Remove Tile" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Drag Tile" }));

    expect(handlers.remove).toHaveBeenCalledWith("t");
    expect(handlers.startDrag).toHaveBeenCalledWith(expect.anything(), "t");
  });

  it("offers Customize only on a builtin tile that has a preset behind it", async () => {
    const handlers = actions();
    const { unmount } = renderControls(ITEM, handlers);

    await openSettings();
    fireEvent.click(menuItem("Customize"));
    expect(handlers.customize).toHaveBeenCalledWith("trending");

    unmount();
    renderControls({ kind: "builtin", id: "s", widget: "stations", size: "M" }, handlers);
    await openSettings();
    expect(screen.queryByRole("menuitem", { name: "Customize" })).toBeNull();
  });

  it("keeps the focus off the tile behind a dialog an entry opens, and hands it back after any other", async () => {
    renderControls(ITEM);
    const settings = screen.getByRole("button", { name: "Settings for Tile" });

    await openSettings();
    fireEvent.click(menuItem("Customize"));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(settings).not.toHaveFocus();

    await openSettings();
    fireEvent.click(menuItem("Move later"));
    await waitFor(() => expect(settings).toHaveFocus());
  });

  it("offers Edit in place of Customize on a tile of my own, and nothing once its widget is gone", async () => {
    const handlers = actions();
    const item: BoardItem = { kind: "custom", id: "c", widgetId: "w_1", size: "M" };
    const { unmount } = renderControls(item, handlers);

    await openSettings();
    expect(screen.queryByRole("menuitem", { name: "Customize" })).toBeNull();
    fireEvent.click(menuItem("Edit"));
    expect(handlers.edit).toHaveBeenCalledWith("w_1");

    unmount();
    render(
      <BoardTileEditControls
        item={item}
        device="wide"
        name="Tile"
        editable={false}
        rowSized
        position={1}
        total={2}
        actions={handlers}
        custom={NO_CUSTOM}
      />
    );
    await openSettings();
    expect(screen.queryByRole("menuitem", { name: "Edit" })).toBeNull();
  });

  it("keeps the drag handle out of the tab order, since the arrows do its job from the keyboard", () => {
    renderControls(ITEM);

    expect(screen.getByRole("button", { name: "Drag Tile" })).toHaveAttribute("tabindex", "-1");
  });
});
