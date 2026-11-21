import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ThemeDraft } from "@theme/custom";
import type { Theme } from "@theme/ThemeProvider";

import { colorOf, makeDraft, makeEditor, surfaceFiles } from "../../../__tests__/fixtures";
import { DEFAULT_EDITOR_VIEW } from "../../../constants";
import type { EditorView } from "../../../types";
import { schemeMismatchOf } from "../helpers";
import { EditorNotes } from "../EditorNotes";

const toastSuccess = vi.fn();
let activeTheme: Theme;

vi.mock("@theme/ThemeProvider", () => ({
  useThemeContext: () => ({ theme: activeTheme }),
}));

vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args), error: vi.fn() },
}));

const LIGHT_SURFACE = colorOf(0.98);
const CSS_ON_CUSTOM: EditorView = { ...DEFAULT_EDITOR_VIEW, mode: "css", file: "custom.css" };

beforeEach(() => {
  activeTheme = "custom";
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditorNotes", () => {
  it("shows nothing when the draft is fresh and consistent", () => {
    const { container } = render(<EditorNotes editor={makeEditor()} safeEdit={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("tells the visitor a draft from the last visit was restored, with its time", () => {
    render(
      <EditorNotes editor={makeEditor({ restoredAt: new Date(2026, 10, 20, 14, 5).getTime() })} safeEdit={false} />
    );

    expect(screen.getByText("Draft from your last visit")).toBeInTheDocument();
    expect(screen.getByText(/It is not saved yet/)).toBeInTheDocument();
  });

  it("says the page stays on the active theme while editing without applying", () => {
    activeTheme = "ocean";
    render(<EditorNotes editor={makeEditor()} safeEdit />);

    expect(screen.getByText("Editing without applying.")).toBeInTheDocument();
    expect(screen.getByText(/This page stays on Ocean/)).toBeInTheDocument();
  });

  it("does not say it once Custom is the active theme", () => {
    render(<EditorNotes editor={makeEditor()} safeEdit />);

    expect(screen.queryByText("Editing without applying.")).not.toBeInTheDocument();
  });

  it("does not say it without the edit param", () => {
    activeTheme = "ocean";
    render(<EditorNotes editor={makeEditor()} safeEdit={false} />);

    expect(screen.queryByText("Editing without applying.")).not.toBeInTheDocument();
  });

  it("warns about a Light scheme over dark surfaces and offers a light set", async () => {
    const editor = makeEditor({ draft: makeDraft({ scheme: "light" }) });
    render(<EditorNotes editor={editor} safeEdit={false} />);

    expect(screen.getByText(/Your surfaces are still dark/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Start from a light set" }));

    const change = vi.mocked(editor.change);
    expect(change).toHaveBeenCalledTimes(1);
    expect(schemeMismatchOf(change.mock.calls[0][0])).toBeNull();
    expect(toastSuccess).toHaveBeenCalledWith(
      "Surfaces, text and status colors now start from a light set. Brand colors are kept."
    );
  });

  it("warns about a Dark scheme over light surfaces and offers to switch to Light", async () => {
    const draft = makeDraft({ scheme: "dark" }, surfaceFiles(LIGHT_SURFACE));
    const editor = makeEditor({ draft });
    render(<EditorNotes editor={editor} safeEdit={false} />);

    expect(screen.getByText(/Your surfaces are light but the scheme is Dark/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Switch the scheme to Light" }));

    const next: ThemeDraft = vi.mocked(editor.change).mock.calls[0][0];
    expect(next.meta.scheme).toBe("light");
    expect(next.files).toEqual(draft.files);
  });

  it("stays quiet for a Light scheme over light surfaces", () => {
    const draft = makeDraft({ scheme: "light" }, surfaceFiles(LIGHT_SURFACE));
    const { container } = render(<EditorNotes editor={makeEditor({ draft })} safeEdit={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("skips the scheme note when the surface is not a color it can read", () => {
    const draft = makeDraft({ scheme: "light" }, surfaceFiles("var(--elsewhere)"));
    const { container } = render(<EditorNotes editor={makeEditor({ draft })} safeEdit={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("names, in visual mode, the files that changed on disk under unsaved edits", () => {
    const draft = makeDraft({}, { "custom.css": "mine {}", [DEFAULT_EDITOR_VIEW.file]: ":root {}" });
    const editor = makeEditor({ draft, conflicts: ["custom.css", DEFAULT_EDITOR_VIEW.file] });
    render(<EditorNotes editor={editor} safeEdit={false} />);

    expect(screen.getByText("Changed on disk while you were editing.")).toBeInTheDocument();
    expect(screen.getByText(/custom\.css, tokens\/brand\.css\. Saving keeps your version\./)).toBeInTheDocument();
  });

  it("reloads every named file from disk in one press", async () => {
    const editor = makeEditor({ conflicts: ["custom.css", "tokens/brand.css"] });
    render(<EditorNotes editor={editor} safeEdit={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Reload from disk" }));

    expect(vi.mocked(editor.takeTheirs).mock.calls).toEqual([["custom.css"], ["tokens/brand.css"]]);
    expect(editor.keepMine).not.toHaveBeenCalled();
  });

  it("keeps the draft's version of every named file in one press", async () => {
    const editor = makeEditor({ conflicts: ["custom.css", "tokens/brand.css"] });
    render(<EditorNotes editor={editor} safeEdit={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Keep mine" }));

    expect(vi.mocked(editor.keepMine).mock.calls).toEqual([["custom.css"], ["tokens/brand.css"]]);
    expect(editor.takeTheirs).not.toHaveBeenCalled();
  });

  it("leaves the file open in CSS mode to that mode's own notice", () => {
    const draft = makeDraft({}, { "custom.css": "mine {}", "tokens/brand.css": ":root {}" });
    const view = CSS_ON_CUSTOM;
    const editor = makeEditor({ draft, view, conflicts: ["custom.css", "tokens/brand.css"] });
    render(<EditorNotes editor={editor} safeEdit={false} />);

    expect(screen.getByText(/^tokens\/brand\.css\. Saving keeps your version\./)).toBeInTheDocument();
  });

  it("says nothing in CSS mode when the only such file is the open one", () => {
    const draft = makeDraft({}, { "custom.css": "mine {}" });
    const view = CSS_ON_CUSTOM;
    const { container } = render(
      <EditorNotes editor={makeEditor({ draft, view, conflicts: ["custom.css"] })} safeEdit={false} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("still names, in CSS mode, a file the draft deleted, which that mode cannot open", () => {
    const draft = makeDraft({}, { "tokens/brand.css": ":root {}" });
    const view = CSS_ON_CUSTOM;
    render(<EditorNotes editor={makeEditor({ draft, view, conflicts: ["custom.css"] })} safeEdit={false} />);

    expect(screen.getByText(/^custom\.css\. Saving keeps your version\./)).toBeInTheDocument();
  });
});
