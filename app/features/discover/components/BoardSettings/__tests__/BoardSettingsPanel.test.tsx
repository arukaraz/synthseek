import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardAppearance, BoardTemplateApplied, BoardTemplatePreview } from "@hooks/api/queries/board/types";
import { act, fireEvent, render, screen } from "@test/test-utils";

const mocks = vi.hoisted(() => ({
  appearance: vi.fn<() => BoardAppearance | undefined>(),
  setAppearance: vi.fn<(appearance: BoardAppearance) => void>(),
  preview: vi.fn<(input: { json: string }, options: { onSuccess: (report: BoardTemplatePreview) => void }) => void>(),
  apply: vi.fn<(input: { json: string }, options: { onSuccess: (applied: BoardTemplateApplied) => void }) => void>(),
  exporter: vi.fn<(input: unknown, options: { onSuccess: (template: unknown) => void }) => void>(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast: mocks.toast }));

vi.mock("@hooks/api/queries/board/useBoardAppearance", () => ({
  useBoardAppearance: () => ({ data: mocks.appearance() }),
}));
vi.mock("@hooks/api/mutations/board/useSetBoardAppearance", () => ({
  useSetBoardAppearance: () => mocks.setAppearance,
}));
vi.mock("@hooks/api/mutations/board/usePreviewBoardTemplate", () => ({
  usePreviewBoardTemplate: () => ({ mutate: mocks.preview, isPending: false }),
}));
vi.mock("@hooks/api/mutations/board/useApplyBoardTemplate", () => ({
  useApplyBoardTemplate: () => ({ mutate: mocks.apply, isPending: false }),
}));
vi.mock("@hooks/api/mutations/board/useExportBoardTemplate", () => ({
  useExportBoardTemplate: () => ({ mutate: mocks.exporter, isPending: false }),
}));

import { BoardSettingsPanel } from "../BoardSettingsPanel";

const READABLE: BoardTemplatePreview = {
  ok: true,
  name: "Crates",
  description: "",
  appearance: { density: "spacious", text: "small" },
  tiles: 3,
  widgets: 0,
  skippedItems: [],
  rejectedWidgets: [],
  needs: [],
  blocked: null,
};

const APPLIED: BoardTemplateApplied = {
  layout: { schemaVersion: 3, items: [] },
  appearance: { density: "spacious", text: "small" },
  undo: { layout: null, appearance: { density: "comfortable", text: "default" }, widgetIds: [] },
};

function pasteTemplate(json: string) {
  fireEvent.change(screen.getByLabelText("Board template JSON"), { target: { value: json } });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.appearance.mockReturnValue({ density: "comfortable", text: "default" });
});

describe("BoardSettingsPanel", () => {
  it("saves the density and the text size the member picks, keeping the other axis", () => {
    const onApplied = vi.fn();
    render(<BoardSettingsPanel items={[]} onApplied={onApplied} />);

    fireEvent.click(screen.getByRole("tab", { name: "Compact" }));
    fireEvent.click(screen.getByRole("tab", { name: "Large" }));

    expect(mocks.setAppearance.mock.calls).toEqual([
      [{ density: "compact", text: "default" }],
      [{ density: "comfortable", text: "large" }],
    ]);
  });

  it("offers no density or text choice until the member's own look has loaded", () => {
    mocks.appearance.mockReturnValue(undefined);
    render(<BoardSettingsPanel items={[]} onApplied={vi.fn()} />);

    expect(screen.queryByRole("tab", { name: "Comfortable" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Default" })).toBeNull();
  });

  it("checks a pasted template before applying it, then hands the applied board up", () => {
    const onApplied = vi.fn();
    render(<BoardSettingsPanel items={[]} onApplied={onApplied} />);
    pasteTemplate('{"kind":"synthseek-board-template"}');
    expect(screen.queryByRole("button", { name: "Apply template" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    act(() => mocks.preview.mock.calls[0]?.[1].onSuccess(READABLE));

    expect(screen.getByText("Crates: 3 widgets on the board")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Apply template" }));
    expect(mocks.apply.mock.calls[0]?.[0]).toEqual({ json: '{"kind":"synthseek-board-template"}' });
    act(() => mocks.apply.mock.calls[0]?.[1].onSuccess(APPLIED));
    expect(onApplied).toHaveBeenCalledWith(APPLIED);
  });

  it("drops a check that answers for text the member has since replaced", () => {
    render(<BoardSettingsPanel items={[]} onApplied={vi.fn()} />);
    pasteTemplate('{"name":"A"}');
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    pasteTemplate('{"name":"B"}');

    act(() => mocks.preview.mock.calls[0]?.[1].onSuccess(READABLE));

    expect(screen.queryByText("Crates: 3 widgets on the board")).toBeNull();
    expect(screen.queryByRole("button", { name: "Apply template" })).toBeNull();
  });

  it("does not let a template that would pass a limit be applied", () => {
    render(<BoardSettingsPanel items={[]} onApplied={vi.fn()} />);
    pasteTemplate("{}");
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    act(() => mocks.preview.mock.calls[0]?.[1].onSuccess({ ...READABLE, blocked: { reason: "feedLimit", max: 6 } }));

    expect(screen.getByText("This would read more than 6 different feed addresses.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply template" })).toBeDisabled();
  });

  it("lists the problems of a file that is not a template and offers no apply", () => {
    render(<BoardSettingsPanel items={[]} onApplied={vi.fn()} />);
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

  it("exports the board it is given under the name typed", () => {
    const items = [{ kind: "builtin" as const, id: "t", widget: "charts" as const, size: "M" as const }];
    render(<BoardSettingsPanel items={items} onApplied={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Template name"), { target: { value: "  Crates  " } });

    fireEvent.click(screen.getByRole("button", { name: "Copy JSON" }));

    expect(mocks.exporter.mock.calls[0]?.[0]).toEqual({ name: "Crates", description: "", items });
  });

  it("says so when a chosen template file cannot be read", async () => {
    const { container } = render(<BoardSettingsPanel items={[]} onApplied={vi.fn()} />);
    const file = new File(["{}"], "board.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: () => Promise.reject(new Error("gone")) });
    const input = container.querySelector("input[type=file]");
    if (!input) throw new Error("no file input");

    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() =>
      expect(mocks.toast.error).toHaveBeenCalledWith("That file could not be read. Choose it again or paste its JSON.")
    );
  });

  it("says so when the browser will not copy the exported template", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn(async () => Promise.reject(new Error("denied"))) } });
    render(<BoardSettingsPanel items={[]} onApplied={vi.fn()} />);

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
