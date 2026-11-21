import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ThemeDraft } from "@theme/custom";
import type { Theme } from "@theme/ThemeProvider";

import { colorOf, makeDraft, makeEditor, surfaceFiles } from "../../../__tests__/fixtures";
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
});
