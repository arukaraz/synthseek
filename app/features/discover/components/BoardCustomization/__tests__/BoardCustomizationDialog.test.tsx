import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@components/ui/Tooltip";
import type { BoardAppearance, BoardItem, BoardLists, BoardTemplatePreview } from "@hooks/api/queries/board/types";
import type { WidgetDocument } from "@hooks/api/queries/widgets/types";
import { DRAG_GHOST_CLASS } from "@hooks/ui/board/constants";
import { PHONE_QUERY } from "@hooks/ui/constants";
import { createWidget, createWidgetCatalog, createWidgetGrammar } from "@test/factories";
import { act, fireEvent, render, screen, within } from "@test/test-utils";

import { customWidgetsById, withBackgrounds } from "../../ExploreBoard/helpers";
import type { BoardCustomizationSave, CustomizationSection } from "../../ExploreBoard/types";
import { BoardCustomizationDialog } from "../BoardCustomizationDialog";

const { size, templates, myWidgets, removeWidget } = vi.hoisted(() => ({
  size: { width: 1000, height: 600 },
  templates: {
    preview: vi.fn<(input: { json: string }, options: { onSuccess: (report: BoardTemplatePreview) => void }) => void>(),
    apply: vi.fn(),
    pending: false,
  },
  myWidgets: { data: new Array<WidgetDocument>() },
  removeWidget: vi.fn<(input: { id: string }, options: { onSuccess: () => void }) => void>(),
}));

vi.mock("@hooks/api/mutations/board/usePreviewBoardTemplate", () => ({
  usePreviewBoardTemplate: () => ({ mutate: templates.preview, isPending: false }),
}));
vi.mock("@hooks/api/mutations/board/useApplyBoardTemplate", () => ({
  useApplyBoardTemplate: () => ({ mutate: templates.apply, isPending: templates.pending }),
}));
vi.mock("@hooks/api/mutations/board/useExportBoardTemplate", () => ({
  useExportBoardTemplate: () => ({ mutate: vi.fn(), isPending: false }),
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
vi.mock("@hooks/ui/useElementWidth", () => ({ useElementWidth: () => [() => undefined, size.width] }));
vi.mock("@hooks/ui/useElementHeight", () => ({ useElementHeight: () => [() => undefined, size.height] }));
vi.mock("../../CustomWidget/CustomWidget", () => ({ CustomWidget: () => <div data-preview="custom" /> }));
vi.mock("../../WidgetGallery/WidgetPreview", () => ({ WidgetPreview: () => <div data-preview="gallery" /> }));
vi.mock("../../WidgetGallery/CustomWidgetPreview", () => ({
  CustomWidgetPreview: () => <div data-preview="mine" />,
}));
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

const MOBILE: BoardItem[] = [{ kind: "builtin", id: "m", widget: "requests", size: "S" }];

const LISTS: BoardLists = { items: ITEMS, mobile: MOBILE };

const LOOK: BoardAppearance = { density: "comfortable", text: "default" };

interface RenderOptions {
  lists?: BoardLists;
  device?: "wide" | "narrow";
  section?: CustomizationSection;
}

function renderDialog({ lists = LISTS, device = "wide", section = "board" }: RenderOptions = {}) {
  const onSave = vi.fn<(save: BoardCustomizationSave) => void>();
  const onClose = vi.fn();
  const onTemplateApplied = vi.fn();
  const dialog = (board: BoardLists) => (
    <TooltipProvider>
      <BoardCustomizationDialog
        lists={board}
        device={device}
        opening={{ section, target: null, boardWidth: 1200 }}
        appearance={LOOK}
        custom={customWidgetsById(myWidgets.data)}
        customStatus="ready"
        onSave={onSave}
        onTemplateApplied={onTemplateApplied}
        onClose={onClose}
      />
    </TooltipProvider>
  );
  const { rerender } = render(dialog(lists));
  return { onSave, onClose, onTemplateApplied, boardBecomes: (board: BoardLists) => rerender(dialog(board)) };
}

const STAGED_WIDGET = createWidget({ id: "w_tpl", meta: { ...createWidget().meta, name: "Crate mix" } });

const READABLE: BoardTemplatePreview = {
  ok: true,
  name: "Crates",
  description: "",
  appearance: { density: "spacious", text: "small" },
  tiles: 2,
  mobileTiles: 2,
  widgets: 1,
  skippedItems: [],
  rejectedWidgets: [],
  needs: [],
  blocked: null,
  layout: {
    items: [
      { kind: "builtin", id: "t1", widget: "requests", size: "L" },
      { kind: "custom", id: "t2", widgetId: "w_tpl", size: "M" },
    ],
    mobile: [{ kind: "custom", id: "t3", widgetId: "w_tpl", size: "M" }],
  },
  documents: [STAGED_WIDGET],
};

function settingsColumn(): HTMLElement {
  const column = screen.getByRole("tablist", { name: "Board settings sections" }).closest("aside");
  if (!(column instanceof HTMLElement)) throw new Error("no settings column");
  return column;
}

function checkTemplate() {
  openTab("Templates");
  fireEvent.change(screen.getByLabelText("Board template JSON"), { target: { value: "{}" } });
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
  act(() => templates.preview.mock.calls.at(-1)?.[1].onSuccess(READABLE));
}

function openTab(name: string) {
  fireEvent.click(screen.getByRole("tab", { name }));
}

function openSection(name: "Board" | "Widgets") {
  fireEvent.click(
    within(screen.getByRole("tablist", { name: "Board Customization sections" })).getByRole("tab", { name })
  );
}

function tileNamed(name: RegExp): HTMLElement {
  return screen.getByRole("group", { name });
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
  size.width = 1000;
  size.height = 600;
  templates.pending = false;
  myWidgets.data = [];
});

describe("BoardCustomizationDialog", () => {
  it("opens on the Board section with Board and Widgets as the main tabs on the side", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: "Board Customization" })).toBeInTheDocument();
    const sections = screen.getByRole("tablist", { name: "Board Customization sections" });
    expect(sections).toHaveAttribute("aria-orientation", "vertical");
    expect(
      within(sections)
        .getAllByRole("tab")
        .map((tab) => tab.textContent)
    ).toEqual(["Board", "Widgets"]);
    expect(within(sections).getByRole("tab", { name: "Board" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Appearance" })).toHaveAttribute("aria-selected", "true");
  });

  it("arranges the layout of the device it was opened on, and the other one from its tab", () => {
    renderDialog({ device: "narrow" });

    expect(screen.getByRole("tab", { name: "Mobile" })).toHaveAttribute("aria-selected", "true");
    expect(tileNamed(/^Recent requests, position 1 of 1/)).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /^Recent Scrobbles/ })).toBeNull();

    openTab("Desktop");

    expect(tileNamed(/^Recent Scrobbles, position 1 of 2/)).toBeInTheDocument();
  });

  it("offers every size on the mobile layout too", () => {
    renderDialog({ device: "narrow" });

    expect(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Small" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));

    expect(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("saves both layouts once, with the one the member did not touch as it was", () => {
    const { onSave } = renderDialog();
    openTab("Mobile");
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));

    save();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      lists: { items: ITEMS, mobile: [expect.objectContaining({ id: "m", size: "L" })] },
      appearance: null,
    });
  });

  it("keeps a change to one layout while the member arranges the other", () => {
    const { onSave } = renderDialog();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));
    openTab("Mobile");
    fireEvent.click(screen.getByRole("button", { name: "Remove Recent requests" }));

    save();

    expect(onSave).toHaveBeenCalledWith({
      lists: { items: [ITEMS[0], expect.objectContaining({ id: "b", size: "L" })], mobile: [] },
      appearance: null,
    });
  });

  it("keeps the arrangement on the left while the tabs and their content share the right column", () => {
    renderDialog();
    const column = settingsColumn();

    expect(column).toContainElement(screen.getByRole("radiogroup", { name: "Density" }));
    expect(column).not.toContainElement(tileNamed(/^Recent Scrobbles/));

    openTab("Templates");

    expect(column).toContainElement(screen.getByLabelText("Board template JSON"));
    expect(screen.getByRole("link", { name: "Documentation" })).toHaveAttribute(
      "href",
      "https://docs.synthseek.dev/widget-templates"
    );
  });

  it("holds a style change in the dialog and hands it up only on Save, with the look it replaces", () => {
    const { onSave } = renderDialog();

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    expect(onSave).not.toHaveBeenCalled();
    save();

    expect(onSave).toHaveBeenCalledWith({
      lists: null,
      appearance: { next: { density: "compact", text: "default" }, previous: LOOK },
    });
  });

  it("reads a style picked back to the saved one as no change", () => {
    renderDialog();

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    fireEvent.click(screen.getByRole("radio", { name: "Comfortable" }));

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("turns every tile's background off on both layouts and saves them", () => {
    const { onSave } = renderDialog();

    fireEvent.click(screen.getByRole("radio", { name: "Off" }));
    save();

    expect(onSave).toHaveBeenCalledWith({
      lists: { items: withBackgrounds(ITEMS, false), mobile: withBackgrounds(MOBILE, false) },
      appearance: null,
    });
  });

  it("asks before closing from another tab with an unsaved change", () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByRole("radio", { name: "Large" }));

    openSection("Widgets");
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("follows a board saved elsewhere while nothing is arranged, so nothing reads as changed", () => {
    const { onClose, boardBecomes } = renderDialog();

    boardBecomes({ items: withBackgrounds(ITEMS, false), mobile: MOBILE });

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Discard changes?")).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows an applied template on both layouts and sends nothing until Save", () => {
    renderDialog();
    checkTemplate();

    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));

    expect(templates.apply).not.toHaveBeenCalled();
    expect(screen.queryByRole("group", { name: /^Recent Scrobbles/ })).toBeNull();
    expect(tileNamed(/^Recent requests, position 1 of 2/)).toBeInTheDocument();
    expect(tileNamed(/^Crate mix, position 2 of 2/)).toBeInTheDocument();
    openTab("Mobile");
    expect(tileNamed(/^Crate mix, position 1 of 1/)).toBeInTheDocument();
    openTab("Appearance");
    expect(screen.getByRole("radio", { name: "Spacious" })).toHaveAttribute("aria-checked", "true");
  });

  it("applies a staged template on Save with both layouts and the look the member left it in", () => {
    const { onSave, onTemplateApplied } = renderDialog();
    checkTemplate();
    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    openTab("Appearance");
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Small" }));
    fireEvent.click(screen.getByRole("radio", { name: "Large" }));

    save();

    expect(onSave).not.toHaveBeenCalled();
    expect(templates.apply).toHaveBeenCalledWith(
      {
        json: "{}",
        layout: {
          items: [
            expect.objectContaining({ id: "t1", size: "S" }),
            expect.objectContaining({ id: "t2", widgetId: "w_tpl" }),
          ],
          mobile: [expect.objectContaining({ id: "t3", widgetId: "w_tpl" })],
        },
        appearance: { density: "spacious", text: "large" },
      },
      { onSuccess: onTemplateApplied }
    );
  });

  it("puts both layouts back when the staged template is cancelled", () => {
    renderDialog();
    checkTemplate();
    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));

    fireEvent.click(within(settingsColumn()).getByRole("button", { name: "Cancel" }));

    expect(tileNamed(/^Recent Scrobbles, position 1 of 2/)).toBeInTheDocument();
    openTab("Mobile");
    expect(tileNamed(/^Recent requests, position 1 of 1/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("asks before a template replaces an unsaved change, and stages it only once confirmed", () => {
    renderDialog();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));
    checkTemplate();

    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    expect(
      screen.getByText("The template replaces the board, so your unsaved changes will be lost.")
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /^Recent Scrobbles/, hidden: true })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Apply template" }).at(-1) ?? document.body);

    expect(screen.queryByRole("group", { name: /^Recent Scrobbles/ })).toBeNull();
    expect(templates.apply).not.toHaveBeenCalled();
  });

  it("cannot be closed while a template is being applied", () => {
    templates.pending = true;
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Discard changes?")).toBeNull();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();
  });

  it("draws every tile of the board at scale, without the widgets' own info", () => {
    renderDialog();

    expect(tileNamed(/^Recent Scrobbles, position 1 of 2/)).toBeInTheDocument();
    expect(document.querySelector("[data-preview='scrobbles']")).toHaveAttribute("data-info", "");
    expect(document.querySelector("[data-preview='scrobbles']")?.closest("[inert]")).not.toBeNull();
  });

  it("removes a tile from the draft and says so when the layout would end up empty", () => {
    const { onSave } = renderDialog({ lists: { items: [ITEMS[0]], mobile: MOBILE } });

    fireEvent.click(screen.getByRole("button", { name: "Remove Recent Scrobbles" }));
    expect(screen.getByText("Your board will be empty.")).toBeInTheDocument();

    save();
    expect(onSave).toHaveBeenCalledWith({ lists: { items: [], mobile: MOBILE }, appearance: null });
  });

  it("asks before throwing changes away, from Cancel and from the close button alike", () => {
    const { onClose, onSave } = renderDialog();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keep arranging" }));
    expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("starts a drag from a mouse press on the tile but not from its buttons", () => {
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    HTMLElement.prototype.animate = vi.fn();
    renderDialog();
    const tile = tileNamed(/^Recent Scrobbles/);
    const ghosts = () => Array.from(document.body.children).filter((node) => node.className.includes(DRAG_GHOST_CLASS));

    fireEvent.pointerDown(within(tile).getByRole("button", { name: "Large" }), { pointerType: "mouse", button: 0 });
    expect(ghosts()).toHaveLength(0);

    fireEvent.pointerDown(tile, { pointerType: "mouse", button: 0 });
    expect(ghosts()).toHaveLength(1);
  });

  it("adds a widget from the Widgets section to the layouts the member picks, and only on Save", async () => {
    const { onSave } = renderDialog();
    openSection("Widgets");

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
    openSection("Widgets");
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
    openSection("Widgets");

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
    const { onSave } = renderDialog({ lists, section: "widgets" });
    fireEvent.click(
      within(screen.getByRole("tablist", { name: "Widget lists" })).getByRole("tab", { name: "My widgets" })
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Most played" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    save();

    expect(removeWidget).toHaveBeenCalledWith({ id: "w_1" }, expect.anything());
    expect(onSave).toHaveBeenCalledWith({ lists: { items: ITEMS, mobile: [] }, appearance: null });
  });

  it("keeps the member's own widgets out of a staged template, saying why on the disabled Add", async () => {
    myWidgets.data = [createWidget({ id: "w_1" })];
    const { onSave } = renderDialog();
    checkTemplate();
    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    openSection("Widgets");
    fireEvent.click(
      within(screen.getByRole("tablist", { name: "Widget lists" })).getByRole("tab", { name: "My widgets" })
    );
    const add = screen.getByRole("button", { name: "Add Most played to the board" });

    expect(add).toHaveAttribute("aria-disabled", "true");
    const user = userEvent.setup();
    await user.hover(add);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Save or cancel the template first, then add your own widgets."
    );
    await user.click(add);
    expect(screen.queryByRole("menuitem", { name: "Desktop" })).toBeNull();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("keeps the member's own widgets from being deleted under a staged template, saying why", async () => {
    myWidgets.data = [createWidget({ id: "w_1" })];
    removeWidget.mockClear();
    renderDialog();
    checkTemplate();
    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    openSection("Widgets");
    fireEvent.click(
      within(screen.getByRole("tablist", { name: "Widget lists" })).getByRole("tab", { name: "My widgets" })
    );
    const remove = screen.getByRole("button", { name: "Delete Most played" });

    expect(remove).toHaveAttribute("aria-disabled", "true");
    const user = userEvent.setup();
    await user.hover(remove);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Save or cancel the template first, then delete your widget."
    );
    await user.click(remove);
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    expect(removeWidget).not.toHaveBeenCalled();
  });

  it("keeps the phone's tab bar off a wider screen", () => {
    renderDialog();

    expect(screen.getAllByRole("tablist", { name: "Board Customization sections" })).toHaveLength(1);
  });
});

describe("BoardCustomizationDialog on a phone", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: query === PHONE_QUERY,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", { writable: true, configurable: true, value: undefined });
  });

  function tabBar(): HTMLElement {
    const bar = screen.getAllByRole("tablist", { name: "Board Customization sections" }).at(-1);
    if (!(bar instanceof HTMLElement)) throw new Error("no tab bar");
    return bar;
  }

  function showPane(name: string) {
    fireEvent.click(within(tabBar()).getByRole("tab", { name }));
  }

  function selectedSetting(): string | null {
    const tabs = within(screen.getByRole("tablist", { name: "Board settings sections" })).getAllByRole("tab");
    return tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.textContent ?? null;
  }

  function sectionPanels(): HTMLElement[] {
    return screen.getAllByRole("tabpanel", { hidden: true }).filter((panel) => panel.parentElement === panelsRoot());
  }

  function panelsRoot(): HTMLElement | null {
    return screen.getAllByRole("tablist", { name: "Board Customization sections" })[0].parentElement;
  }

  it("lays the four panes out as a bottom tab bar, starting on the arrangement", () => {
    renderDialog();

    expect(
      within(tabBar())
        .getAllByRole("tab")
        .map((tab) => tab.textContent)
    ).toEqual(["Arrange", "Appearance", "Templates", "Widgets"]);
    expect(within(tabBar()).getByRole("tab", { name: "Arrange" })).toHaveAttribute("aria-selected", "true");
    expect(settingsColumn()).toHaveClass("max-sm:hidden");
  });

  it("shows the board settings tab it was given, in place of the arrangement", () => {
    renderDialog();

    showPane("Templates");

    expect(within(tabBar()).getByRole("tab", { name: "Templates" })).toHaveAttribute("aria-selected", "true");
    expect(selectedSetting()).toBe("Templates");
    expect(settingsColumn()).not.toHaveClass("max-sm:hidden");
    expect(sectionPanels().map((panel) => panel.hidden)).toEqual([false]);

    showPane("Appearance");

    expect(selectedSetting()).toBe("Appearance");
  });

  it("moves to the widgets and back to the arrangement", () => {
    renderDialog();

    showPane("Widgets");

    expect(within(tabBar()).getByRole("tab", { name: "Widgets" })).toHaveAttribute("aria-selected", "true");
    expect(sectionPanels().map((panel) => panel.hidden)).toEqual([true, false]);

    showPane("Arrange");

    expect(within(tabBar()).getByRole("tab", { name: "Arrange" })).toHaveAttribute("aria-selected", "true");
    expect(sectionPanels().map((panel) => panel.hidden)).toEqual([false, true]);
    expect(settingsColumn()).toHaveClass("max-sm:hidden");
  });
});
