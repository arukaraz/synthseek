import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardItem, BoardTemplatePreview } from "@hooks/api/queries/board/types";
import { act, fireEvent, render, screen } from "@test/test-utils";

const mocks = vi.hoisted(() => ({
  preview: vi.fn<(input: { json: string }, options: { onSuccess: (report: BoardTemplatePreview) => void }) => void>(),
  exporter: vi.fn<(input: unknown, options: { onSuccess: (template: unknown) => void }) => void>(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast: mocks.toast }));

vi.mock("@hooks/api/mutations/board/usePreviewBoardTemplate", () => ({
  usePreviewBoardTemplate: () => ({ mutate: mocks.preview, isPending: false }),
}));
vi.mock("@hooks/api/mutations/board/useExportBoardTemplate", () => ({
  useExportBoardTemplate: () => ({ mutate: mocks.exporter, isPending: false }),
}));

import { TemplatesPanel } from "../TemplatesPanel";
import type { StageTemplate } from "../types";

const READABLE: BoardTemplatePreview = {
  ok: true,
  name: "Crates",
  description: "",
  appearance: { density: "spacious", text: "small" },
  tiles: 3,
  mobileTiles: 3,
  widgets: 0,
  skippedItems: [],
  rejectedWidgets: [],
  needs: [],
  blocked: null,
  layout: { items: [], mobile: [] },
  documents: [],
};

interface PanelHandlers {
  staged?: boolean;
  onStage?: StageTemplate;
  onUnstage?: () => void;
}

function openDialog(
  items: BoardItem[] = [],
  { staged = false, onStage = vi.fn(), onUnstage = vi.fn() }: PanelHandlers = {},
  mobile: BoardItem[] = []
) {
  return render(<TemplatesPanel lists={{ items, mobile }} staged={staged} onStage={onStage} onUnstage={onUnstage} />);
}

function pasteTemplate(json: string) {
  fireEvent.change(screen.getByLabelText("Board template JSON"), { target: { value: json } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TemplatesPanel", () => {
  it("shows the templates alone, with no choice of look", () => {
    openDialog();

    expect(screen.getByLabelText("Board template JSON")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("checks a pasted template before staging it, and hands it up without applying anything", () => {
    const onStage = vi.fn<StageTemplate>();
    openDialog([], { onStage });
    pasteTemplate('{"kind":"synthseek-board-template"}');
    expect(screen.queryByRole("button", { name: "Apply template" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    act(() => mocks.preview.mock.calls[0]?.[1].onSuccess(READABLE));

    expect(screen.getByText("Crates: 3 widgets on Desktop")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    expect(onStage).toHaveBeenCalledWith('{"kind":"synthseek-board-template"}', READABLE);
  });

  it("says a staged template waits for Save, and takes it back out when the field changes", () => {
    const onUnstage = vi.fn();
    const view = openDialog([], { onUnstage });
    pasteTemplate("{}");
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    act(() => mocks.preview.mock.calls[0]?.[1].onSuccess(READABLE));

    view.rerender(<TemplatesPanel lists={{ items: [], mobile: [] }} staged onStage={vi.fn()} onUnstage={onUnstage} />);

    expect(
      screen.getByText("This template is in the arrangement. Save changes to put it on your board.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply template" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onUnstage).toHaveBeenCalledTimes(1);
  });

  it("drops a check that answers for text the member has since replaced", () => {
    openDialog();
    pasteTemplate('{"name":"A"}');
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    pasteTemplate('{"name":"B"}');

    act(() => mocks.preview.mock.calls[0]?.[1].onSuccess(READABLE));

    expect(screen.queryByText("Crates: 3 widgets on Desktop")).toBeNull();
    expect(screen.queryByRole("button", { name: "Apply template" })).toBeNull();
  });

  it("does not let a template that would pass a limit be applied", () => {
    openDialog();
    pasteTemplate("{}");
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    act(() => mocks.preview.mock.calls[0]?.[1].onSuccess({ ...READABLE, blocked: { reason: "feedLimit", max: 6 } }));

    expect(screen.getByText("This would read more than 6 different feed addresses.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply template" })).toBeDisabled();
  });

  it("lists the problems of a file that is not a template and offers no apply", () => {
    openDialog();
    pasteTemplate("nope");
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    act(() =>
      mocks.preview.mock.calls[0]?.[1].onSuccess({
        ok: false,
        problems: [{ path: "", problem: { code: "invalidJson" } }],
      })
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apply template" })).toBeNull();
  });

  it("exports both arrangements of the board it is given under the name typed", () => {
    const items: BoardItem[] = [{ kind: "builtin", id: "t", widget: "charts", size: "M" }];
    const mobile: BoardItem[] = [{ kind: "builtin", id: "m", widget: "genres", size: "S" }];
    openDialog(items, {}, mobile);
    fireEvent.change(screen.getByLabelText("Template name"), { target: { value: "  Crates  " } });

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));

    expect(mocks.exporter.mock.calls[0]?.[0]).toEqual({ name: "Crates", description: "", items, mobile });
  });

  it("says so when a chosen template file cannot be read", async () => {
    openDialog();
    const file = new File(["{}"], "board.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: () => Promise.reject(new Error("gone")) });
    const input = document.querySelector("input[type=file]");
    if (!input) throw new Error("no file input");

    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith("That file could not be read. Choose it again or paste its JSON.")
    );
  });

  it("says so when the browser will not copy the exported template", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn(async () => Promise.reject(new Error("denied"))) } });
    openDialog();

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));
    mocks.exporter.mock.calls[0]?.[1].onSuccess({ kind: "synthseek-board-template" });

    await vi.waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith(
        "This browser would not copy it. Try again over HTTPS, or allow clipboard access."
      )
    );
    expect(mocks.toast.success).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
