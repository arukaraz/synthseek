import { beforeEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@components/ui/Tooltip";
import type { BoardItem, BoardLists } from "@hooks/api/queries/board/types";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";
import { createWidget, createWidgetCatalog, createWidgetGrammar } from "@test/factories";
import { fireEvent, render, screen, within } from "@test/test-utils";

import { customWidgetsById, withBackgrounds } from "../../ExploreBoard/helpers";
import type { BoardSave } from "../../ExploreBoard/types";
import { WidgetsDialog } from "../WidgetsDialog";

const { myWidgets, removeWidget } = vi.hoisted(() => ({
  myWidgets: { data: new Array<WidgetDocument>() },
  removeWidget: vi.fn<(input: { id: string }, options: { onSuccess: () => void }) => void>(),
}));

vi.mock("@hooks/api/queries/widgets/useMyWidgets", () => ({ useMyWidgets: () => myWidgets }));
vi.mock("@hooks/api/queries/widgets/useWidgetCatalog", () => ({
  useWidgetCatalog: () => ({ data: createWidgetCatalog() }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetGrammar", () => ({
  useWidgetGrammar: () => ({ data: createWidgetGrammar() }),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetPresets", () => ({ useWidgetPresets: () => ({ data: [] }) }));
vi.mock("@hooks/api/queries/widgets/useWidgetHousehold", () => ({ useWidgetHousehold: () => ({ data: [] }) }));
vi.mock("@hooks/api/mutations/widgets/useSaveWidget", () => ({
  useSaveWidget: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@hooks/api/mutations/widgets/useRemoveWidget", () => ({
  useRemoveWidget: () => ({ mutate: removeWidget, isPending: false }),
}));
vi.mock("@hooks/api/mutations/widgets/useImportWidgetPreview", () => ({
  useImportWidgetPreview: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@modules/providers/CountryProvider", () => ({ useCountry: () => ({ country: "MX" }) }));
vi.mock("@hooks/ui/useElementWidth", () => ({ useElementWidth: () => [() => undefined, 1000] }));
vi.mock("@hooks/ui/useElementHeight", () => ({ useElementHeight: () => [() => undefined, 600] }));
vi.mock("../../WidgetGallery/WidgetPreview", () => ({ WidgetPreview: () => <div data-preview="gallery" /> }));
vi.mock("../../WidgetGallery/CustomWidgetPreview", () => ({
  CustomWidgetPreview: () => <div data-preview="mine" />,
}));
vi.mock("../../NeverInclude/NeverIncludeCard", () => ({
  NeverIncludeCard: () => <section data-testid="never-include" />,
}));

const ITEMS: BoardItem[] = [
  { kind: "builtin", id: "a", widget: "scrobbles", size: "M" },
  { kind: "builtin", id: "b", widget: "requests", size: "M" },
];

const MOBILE: BoardItem[] = [{ kind: "builtin", id: "m", widget: "requests", size: "S" }];

const LISTS: BoardLists = { items: ITEMS, mobile: MOBILE };

function renderDialog(lists: BoardLists = LISTS) {
  const onSave = vi.fn<(save: BoardSave) => void>();
  const onClose = vi.fn();
  const dialog = (board: BoardLists) => (
    <TooltipProvider>
      <WidgetsDialog
        lists={board}
        opening={{ target: null }}
        custom={customWidgetsById(myWidgets.data)}
        onSave={onSave}
        onClose={onClose}
      />
    </TooltipProvider>
  );
  const { rerender } = render(dialog(lists));
  return { onSave, onClose, boardBecomes: (board: BoardLists) => rerender(dialog(board)) };
}

function openMine() {
  fireEvent.click(
    within(screen.getByRole("tablist", { name: "Widget lists" })).getByRole("tab", { name: "My widgets" })
  );
}

function save() {
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
}

async function pickLayout(trigger: string, layout: string) {
  fireEvent.pointerDown(screen.getByRole("button", { name: trigger }), { button: 0, pointerType: "mouse" });
  fireEvent.click(await screen.findByRole("menuitem", { name: layout }));
}

beforeEach(() => {
  vi.clearAllMocks();
  myWidgets.data = [];
});

describe("WidgetsDialog", () => {
  it("opens as the Widgets dialog with the gallery and My widgets as its only lists", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: "Widgets" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("tablist", { name: "Widget lists" }))
        .getAllByRole("tab")
        .map((tab) => tab.textContent)
    ).toEqual(["Widgets", "My widgets"]);
    expect(screen.getAllByRole("tablist")).toHaveLength(1);
    expect(screen.queryByRole("tab", { name: "Appearance" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Templates" })).toBeNull();
  });

  it("adds a widget to the layouts the member picks, and hands the lists up only on Save", async () => {
    const { onSave } = renderDialog();

    await pickLayout("Add Trending now", "Mobile");
    expect(onSave).not.toHaveBeenCalled();
    save();

    expect(onSave).toHaveBeenCalledWith({
      lists: { items: ITEMS, mobile: [...MOBILE, expect.objectContaining({ kind: "builtin", widget: "trending" })] },
      appearance: null,
    });
  });

  it("offers each card only the layouts it can add to or remove from", async () => {
    renderDialog();
    const menuOf = async (trigger: string) => {
      fireEvent.pointerDown(screen.getByRole("button", { name: trigger }), { button: 0, pointerType: "mouse" });
      const items = (await screen.findAllByRole("menuitem")).map((item) => item.textContent);
      fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
      return items;
    };

    expect(await menuOf("Add Trending now")).toEqual(["Desktop", "Mobile", "Both"]);
    expect(await menuOf("Add Recent Scrobbles")).toEqual(["Mobile"]);
    expect(await menuOf("Remove Recent Scrobbles")).toEqual(["Desktop"]);
    expect(screen.queryByRole("button", { name: "Add Recent requests" })).toBeNull();
    expect(await menuOf("Remove Recent requests")).toEqual(["Desktop", "Mobile", "Both"]);
  });

  it("removes a widget from both layouts at once", async () => {
    const { onSave } = renderDialog();

    await pickLayout("Remove Recent requests", "Both");
    save();

    expect(onSave).toHaveBeenCalledWith({ lists: { items: [ITEMS[0]], mobile: [] }, appearance: null });
  });

  it("drops the tiles of a deleted widget from both layouts in the draft", () => {
    myWidgets.data = [createWidget({ id: "w_1" })];
    removeWidget.mockImplementation((_input, options) => options.onSuccess());
    const lists: BoardLists = {
      items: [...ITEMS, { kind: "custom", id: "c1", widgetId: "w_1", size: "M" }],
      mobile: [{ kind: "custom", id: "c2", widgetId: "w_1", size: "M" }],
    };
    const { onSave } = renderDialog(lists);
    openMine();

    fireEvent.click(screen.getByRole("button", { name: "Delete Most played" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    save();

    expect(removeWidget).toHaveBeenCalledWith({ id: "w_1" }, expect.anything());
    expect(onSave).toHaveBeenCalledWith({ lists: { items: ITEMS, mobile: [] }, appearance: null });
  });

  it("ends My widgets with the Never include card, and keeps it off the gallery", () => {
    renderDialog();
    expect(screen.queryByTestId("never-include")).toBeNull();

    openMine();

    const card = screen.getByTestId("never-include");
    expect(screen.getByRole("button", { name: "New widget" }).compareDocumentPosition(card)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("asks before throwing changes away, from Cancel and from the close button alike", async () => {
    const { onClose, onSave } = renderDialog();
    await pickLayout("Add Trending now", "Desktop");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keep arranging" }));
    expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("asks before throwing changes away on Escape as well", async () => {
    const { onClose } = renderDialog();
    await pickLayout("Add Trending now", "Desktop");

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("follows a board saved elsewhere while nothing is arranged, so nothing reads as changed", () => {
    const { onClose, boardBecomes } = renderDialog();

    boardBecomes({ items: withBackgrounds(ITEMS, false), mobile: MOBILE });

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Discard changes?")).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
