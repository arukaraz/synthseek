import { beforeEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@components/ui/Tooltip";
import type {
  BoardAppearance,
  BoardItem,
  BoardLayout,
  BoardLists,
  BoardTemplateApplied,
  BoardTemplatePreview,
} from "@hooks/api/queries/board/types";
import { DRAG_GHOST_CLASS } from "@hooks/ui/board/constants";
import { PageSaveBar, SettingsSaveScope } from "@features/settings/components/SettingsSaveScope";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { createWidget } from "@test/factories";
import { act, fireEvent, render, screen, waitFor, within } from "@test/test-utils";

import { customWidgetsById, withBackgrounds } from "../../ExploreBoard/helpers";
import { BoardSettingsForm } from "../BoardSettingsForm";

interface ToastAction {
  label: string;
  onClick: () => void;
}

const { size, templates, saveMock, appearanceMock, toastMock, nav } = vi.hoisted(() => ({
  size: { width: 1000, height: 600 },
  templates: {
    preview: vi.fn<(input: { json: string }, options: { onSuccess: (report: BoardTemplatePreview) => void }) => void>(),
    apply: vi.fn<(input: unknown) => Promise<BoardTemplateApplied>>(),
    pending: false,
  },
  saveMock: vi.fn<(layout: BoardLayout) => Promise<boolean>>(() => Promise.resolve(true)),
  appearanceMock: vi.fn<(appearance: BoardAppearance) => Promise<boolean>>(() => Promise.resolve(true)),
  toastMock: { success: vi.fn<(message: string, options?: { action?: ToastAction }) => void>() },
  nav: { router: { push: vi.fn<(href: string) => void>() } },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/appearance/board",
  useRouter: () => nav.router,
}));
vi.mock("sonner", () => ({ toast: toastMock }));
vi.mock("@hooks/api/mutations/board/useSaveBoardLayout", () => ({ useSaveBoardLayout: () => saveMock }));
vi.mock("@hooks/api/mutations/board/useSetBoardAppearance", () => ({ useSetBoardAppearance: () => appearanceMock }));
vi.mock("@hooks/api/mutations/board/useUndoBoardTemplate", () => ({
  useUndoBoardTemplate: () => ({ mutate: vi.fn() }),
}));
vi.mock("@hooks/api/mutations/board/usePreviewBoardTemplate", () => ({
  usePreviewBoardTemplate: () => ({ mutate: templates.preview, isPending: false }),
}));
vi.mock("@hooks/api/mutations/board/useApplyBoardTemplate", () => ({
  useApplyBoardTemplate: () => ({ mutateAsync: templates.apply, isPending: templates.pending }),
}));
vi.mock("@hooks/api/mutations/board/useExportBoardTemplate", () => ({
  useExportBoardTemplate: () => ({ mutate: vi.fn(), isPending: false }),
}));
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

const MOBILE: BoardItem[] = [{ kind: "builtin", id: "m", widget: "requests", size: "S" }];

const LISTS: BoardLists = { items: ITEMS, mobile: MOBILE };

const LOOK: BoardAppearance = { density: "comfortable", text: "default" };

const NO_CUSTOM = customWidgetsById([]);

function renderForm({ lists = LISTS, device = "wide" }: { lists?: BoardLists; device?: "wide" | "narrow" } = {}) {
  const page = (board: BoardLists, look: BoardAppearance) => (
    <TooltipProvider>
      <SettingsSaveScope>
        <a href="/settings/appearance/theme">Theme & language</a>
        <BoardSettingsForm lists={board} device={device} appearance={look} custom={NO_CUSTOM} customStatus="ready" />
        <PageSaveBar />
      </SettingsSaveScope>
    </TooltipProvider>
  );
  const { rerender } = render(page(lists, LOOK));
  return {
    boardBecomes: (board: BoardLists) => rerender(page(board, LOOK)),
    lookBecomes: (look: BoardAppearance) => rerender(page(lists, look)),
  };
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

function openTab(name: string) {
  fireEvent.click(screen.getByRole("tab", { name }));
}

function checkTemplate() {
  openTab("Templates");
  fireEvent.change(screen.getByLabelText("Board template JSON"), { target: { value: "{}" } });
  fireEvent.click(screen.getByRole("button", { name: "Check" }));
  act(() => templates.preview.mock.calls.at(-1)?.[1].onSuccess(READABLE));
}

function tileNamed(name: RegExp): HTMLElement {
  return screen.getByRole("group", { name });
}

function pageBar(): HTMLElement | null {
  return screen.queryByRole("region", { name: enSettings.shell.saveBar.region });
}

function inPageBar(name: string): HTMLElement {
  const bar = pageBar();
  if (!bar) throw new Error("the page save bar is not shown");
  return within(bar).getByRole("button", { name });
}

function saveButton(): HTMLElement {
  return inPageBar(enSettings.shell.saveBar.save);
}

function resetButton(): HTMLElement {
  return inPageBar(enSettings.shell.saveBar.cancel);
}

function lastToastAction(): ToastAction {
  const action = toastMock.success.mock.calls.at(-1)?.[1]?.action;
  if (!action) throw new Error("the toast carried no action");
  return action;
}

beforeEach(() => {
  vi.clearAllMocks();
  size.width = 1000;
  size.height = 600;
  templates.pending = false;
});

describe("BoardSettingsForm", () => {
  it("opens on the device's own layout with the Appearance tab, and the other layout from its tab", () => {
    renderForm({ device: "narrow" });

    expect(screen.getByRole("tab", { name: "Mobile" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Appearance" })).toHaveAttribute("aria-selected", "true");
    expect(tileNamed(/^Recent requests, position 1 of 1/)).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /^Recent Scrobbles/ })).toBeNull();
    expect(screen.getByText(/Drag a widget to move it/)).toBeInTheDocument();

    openTab("Desktop");

    expect(tileNamed(/^Recent Scrobbles, position 1 of 2/)).toBeInTheDocument();
  });

  it("offers every size on the mobile layout too", () => {
    renderForm({ device: "narrow" });

    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));

    expect(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("saves both layouts once on Save, waiting for the server, with the one the member did not touch as it was, and offers an undo", async () => {
    renderForm();
    openTab("Mobile");
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));
    expect(saveMock).not.toHaveBeenCalled();

    fireEvent.click(saveButton());

    expect(saveMock.mock.calls).toEqual([
      [{ schemaVersion: 4, items: ITEMS, mobile: [expect.objectContaining({ id: "m", size: "L" })] }, "confirmed"],
    ]);
    expect(appearanceMock).not.toHaveBeenCalled();
    await waitFor(() => expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board saved"));
    lastToastAction().onClick();
    expect(saveMock.mock.calls.at(-1)).toEqual([{ schemaVersion: 4, items: ITEMS, mobile: MOBILE }]);
  });

  it("keeps a change to one layout while the member arranges the other", () => {
    renderForm();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));
    openTab("Mobile");
    fireEvent.click(screen.getByRole("button", { name: "Remove Recent requests" }));

    fireEvent.click(saveButton());

    expect(saveMock).toHaveBeenCalledWith(
      {
        schemaVersion: 4,
        items: [ITEMS[0], expect.objectContaining({ id: "b", size: "L" })],
        mobile: [],
      },
      "confirmed"
    );
  });

  it("keeps the arrangement apart from the column that holds the Appearance and Templates tabs", () => {
    renderForm();
    const column = settingsColumn();

    expect(column).toContainElement(screen.getByRole("radiogroup", { name: "Density" }));
    expect(column).not.toContainElement(tileNamed(/^Recent Scrobbles/));

    openTab("Templates");

    expect(column).toContainElement(screen.getByLabelText("Board template JSON"));
  });

  it("holds a style change until Save, then saves the look alone with an undo back to the one it replaced", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    expect(appearanceMock).not.toHaveBeenCalled();
    fireEvent.click(saveButton());

    expect(saveMock).not.toHaveBeenCalled();
    expect(appearanceMock.mock.calls).toEqual([[{ density: "compact", text: "default" }, "confirmed"]]);
    await waitFor(() => expect(toastMock.success).toHaveBeenCalled());
    lastToastAction().onClick();
    expect(appearanceMock.mock.calls.at(-1)).toEqual([LOOK]);
  });

  it("reads a style picked back to the saved one as no change", () => {
    renderForm();

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    fireEvent.click(screen.getByRole("radio", { name: "Comfortable" }));

    expect(pageBar()).toBeNull();
  });

  it("settles a saved look, so undoing it from the toast leaves nothing pending", async () => {
    const { lookBecomes } = renderForm();
    const compact: BoardAppearance = { density: "compact", text: "default" };

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    fireEvent.click(saveButton());
    lookBecomes(compact);
    await waitFor(() => expect(toastMock.success).toHaveBeenCalled());
    lastToastAction().onClick();
    lookBecomes(LOOK);

    expect(appearanceMock.mock.calls).toEqual([[compact, "confirmed"], [LOOK]]);
    await waitFor(() => expect(pageBar()).toBeNull());
    expect(screen.getByRole("radio", { name: "Comfortable" })).toHaveAttribute("aria-checked", "true");
  });

  it("joins the page's save bar, so leaving the page with an unsaved board asks first", () => {
    renderForm();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));

    fireEvent.click(screen.getByRole("link", { name: "Theme & language" }));

    expect(screen.getByRole("dialog", { name: enSettings.shell.leaveDialog.title })).toBeInTheDocument();
    expect(nav.router.push).not.toHaveBeenCalled();
  });

  it("stays on the page with the board still unsaved when the server refuses it from the leave dialog", async () => {
    saveMock.mockResolvedValueOnce(false);
    renderForm();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));
    fireEvent.click(screen.getByRole("link", { name: "Theme & language" }));

    fireEvent.click(screen.getByRole("button", { name: enSettings.shell.leaveDialog.save }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(toastMock.success).not.toHaveBeenCalled();
    expect(nav.router.push).not.toHaveBeenCalled();
    expect(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(pageBar()).not.toBeNull();
  });

  it("leaves once the server has kept the board", async () => {
    renderForm();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));
    fireEvent.click(screen.getByRole("link", { name: "Theme & language" }));

    fireEvent.click(screen.getByRole("button", { name: enSettings.shell.leaveDialog.save }));

    await waitFor(() => expect(nav.router.push).toHaveBeenCalledWith("/settings/appearance/theme"));
  });

  it("turns every tile's background off on both layouts and saves them", () => {
    renderForm();

    fireEvent.click(screen.getByRole("radio", { name: "Off" }));
    fireEvent.click(saveButton());

    expect(saveMock).toHaveBeenCalledWith(
      {
        schemaVersion: 4,
        items: withBackgrounds(ITEMS, false),
        mobile: withBackgrounds(MOBILE, false),
      },
      "confirmed"
    );
  });

  it("follows a board saved elsewhere while nothing is arranged, so nothing reads as changed", () => {
    const { boardBecomes } = renderForm();

    boardBecomes({ items: withBackgrounds(ITEMS, false), mobile: MOBILE });

    expect(pageBar()).toBeNull();
  });

  it("puts the saved board back on the page's Cancel, as every Settings card does", () => {
    renderForm();
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Large" }));

    fireEvent.click(resetButton());

    expect(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Medium" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(pageBar()).toBeNull();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("shows an applied template on both layouts and sends nothing until Save", () => {
    renderForm();
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

  it("applies a staged template on Save with both layouts and the look the member left it in, then offers an undo", async () => {
    templates.apply.mockResolvedValue({
      layout: { schemaVersion: 4, items: [], mobile: [] },
      appearance: { density: "spacious", text: "large" },
      undo: { layout: null, appearance: LOOK, widgetIds: [] },
    });
    renderForm();
    checkTemplate();
    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    openTab("Appearance");
    fireEvent.click(within(tileNamed(/^Recent requests/)).getByRole("button", { name: "Small" }));
    fireEvent.click(screen.getByRole("radio", { name: "Large" }));

    fireEvent.click(saveButton());

    expect(saveMock).not.toHaveBeenCalled();
    expect(templates.apply).toHaveBeenCalledWith({
      json: "{}",
      layout: {
        items: [
          expect.objectContaining({ id: "t1", size: "S" }),
          expect.objectContaining({ id: "t2", widgetId: "w_tpl" }),
        ],
        mobile: [expect.objectContaining({ id: "t3", widgetId: "w_tpl" })],
      },
      appearance: { density: "spacious", text: "large" },
    });

    await waitFor(() => expect(toastMock.success.mock.calls.at(-1)?.[0]).toBe("Board template applied"));
    expect(pageBar()).toBeNull();
  });

  it("puts both layouts back when the staged template is cancelled", () => {
    renderForm();
    checkTemplate();
    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));

    fireEvent.click(within(settingsColumn()).getByRole("button", { name: "Cancel" }));

    expect(tileNamed(/^Recent Scrobbles, position 1 of 2/)).toBeInTheDocument();
    openTab("Mobile");
    expect(tileNamed(/^Recent requests, position 1 of 1/)).toBeInTheDocument();
    expect(pageBar()).toBeNull();
  });

  it("asks before a template replaces an unsaved change, and stages it only once confirmed", () => {
    renderForm();
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

  it("holds Save and Cancel while a template is being applied", () => {
    templates.pending = true;
    renderForm();
    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));

    expect(inPageBar(enSettings.shell.saveBar.saving)).toBeDisabled();
    expect(resetButton()).toBeDisabled();
  });

  it("draws every tile of the board at scale, without the widgets' own info", () => {
    renderForm();

    expect(tileNamed(/^Recent Scrobbles, position 1 of 2/)).toBeInTheDocument();
    expect(document.querySelector("[data-preview='scrobbles']")).toHaveAttribute("data-info", "");
    expect(document.querySelector("[data-preview='scrobbles']")?.closest("[inert]")).not.toBeNull();
  });

  it("removes a tile from the draft and says so when the layout would end up empty", () => {
    renderForm({ lists: { items: [ITEMS[0]], mobile: MOBILE } });

    fireEvent.click(screen.getByRole("button", { name: "Remove Recent Scrobbles" }));
    expect(screen.getByText("Your board will be empty.")).toBeInTheDocument();

    fireEvent.click(saveButton());
    expect(saveMock).toHaveBeenCalledWith({ schemaVersion: 4, items: [], mobile: MOBILE }, "confirmed");
  });

  it("starts a drag from a mouse press on the tile but not from its buttons", () => {
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    HTMLElement.prototype.animate = vi.fn();
    renderForm();
    const tile = tileNamed(/^Recent Scrobbles/);
    const ghosts = () => Array.from(document.body.children).filter((node) => node.className.includes(DRAG_GHOST_CLASS));

    fireEvent.pointerDown(within(tile).getByRole("button", { name: "Large" }), { pointerType: "mouse", button: 0 });
    expect(ghosts()).toHaveLength(0);

    fireEvent.pointerDown(tile, { pointerType: "mouse", button: 0 });
    expect(ghosts()).toHaveLength(1);
  });
});
