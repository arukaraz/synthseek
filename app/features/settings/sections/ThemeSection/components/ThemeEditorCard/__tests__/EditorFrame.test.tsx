import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeEditor } from "../../../__tests__/fixtures";
import { DEFAULT_EDITOR_VIEW } from "../../../constants";
import { EditorFrame } from "../EditorFrame";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@theme/ThemeProvider", () => ({
  useThemeContext: () => ({ theme: "custom" }),
}));

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeFetchers: () => ({ preset: vi.fn() }),
}));

vi.mock("@hooks/api/mutations/theme", () => ({
  useCheckThemeImport: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("../../VisualMode/VisualMode", () => ({
  VisualMode: () => (
    <div data-testid="visual-mode">
      <input type="search" aria-label="Search every token" />
      <input type="range" aria-label="Slider" />
      <div role="textbox" contentEditable suppressContentEditableWarning aria-label="Code" />
    </div>
  ),
}));

vi.mock("../LazyCssMode", () => ({
  LazyCssMode: () => <div data-testid="css-mode" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function pressUndo(target: Element) {
  const event = createEvent.keyDown(target, { key: "z", ctrlKey: true });
  fireEvent(target, event);
  return event;
}

describe("EditorFrame", () => {
  it("titles the card and links the theme reference in a new tab", () => {
    render(<EditorFrame editor={makeEditor()} safeEdit={false} />);

    expect(screen.getByRole("heading", { name: "Custom theme" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Theme reference" });
    expect(link).toHaveAttribute("href", "https://docs.synthseek.dev/custom-themes/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("is a card part with no info icon beside its title", () => {
    const { container } = render(<EditorFrame editor={makeEditor()} safeEdit={false} />);

    expect(container.querySelector('[data-part="card"]')).not.toBeNull();
    expect(screen.queryByRole("button", { name: "About your custom theme" })).not.toBeInTheDocument();
  });

  it("shows the visual mode by default and the CSS mode when asked", () => {
    const { rerender } = render(<EditorFrame editor={makeEditor()} safeEdit={false} />);
    expect(screen.getByTestId("visual-mode")).toBeInTheDocument();
    expect(screen.queryByTestId("css-mode")).not.toBeInTheDocument();

    rerender(<EditorFrame editor={makeEditor({ view: { ...DEFAULT_EDITOR_VIEW, mode: "css" } })} safeEdit={false} />);
    expect(screen.getByTestId("css-mode")).toBeInTheDocument();
    expect(screen.queryByTestId("visual-mode")).not.toBeInTheDocument();
  });

  it("keeps the bar outside the region whose rows scroll clear of it", () => {
    render(<EditorFrame editor={makeEditor()} safeEdit={false} />);

    const region = screen.getByTestId("visual-mode").parentElement;

    expect(region).not.toContainElement(screen.getByRole("toolbar", { name: "Theme editor" }));
    expect(region?.parentElement).toContainElement(screen.getByRole("toolbar", { name: "Theme editor" }));
  });

  it("switches the mode through the editor view", async () => {
    const editor = makeEditor();
    render(<EditorFrame editor={editor} safeEdit={false} />);

    await userEvent.click(screen.getByRole("radio", { name: "CSS" }));

    expect(editor.setView).toHaveBeenCalledWith({ mode: "css" });
  });

  it("undoes on Ctrl+Z from anywhere in the card that is not a text field", () => {
    const editor = makeEditor();
    render(<EditorFrame editor={editor} safeEdit={false} />);

    const event = pressUndo(screen.getByRole("radio", { name: "Visual" }));

    expect(editor.undo).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("undoes on Ctrl+Z when the focus is on the page, outside the card", () => {
    const editor = makeEditor();
    render(<EditorFrame editor={editor} safeEdit={false} />);

    const event = pressUndo(document.body);

    expect(editor.undo).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("stops listening for Ctrl+Z once the editor is gone", () => {
    const editor = makeEditor();
    const { unmount } = render(<EditorFrame editor={editor} safeEdit={false} />);
    unmount();

    pressUndo(document.body);

    expect(editor.undo).not.toHaveBeenCalled();
  });

  it("undoes on Ctrl+Z inside a slider and inside an editable code region", () => {
    const editor = makeEditor();
    render(<EditorFrame editor={editor} safeEdit={false} />);

    pressUndo(screen.getByRole("slider", { name: "Slider" }));
    pressUndo(screen.getByRole("textbox", { name: "Code" }));

    expect(editor.undo).toHaveBeenCalledTimes(2);
  });

  it("leaves Ctrl+Z to a text field's own undo", () => {
    const editor = makeEditor();
    render(<EditorFrame editor={editor} safeEdit={false} />);

    const event = pressUndo(screen.getByRole("searchbox", { name: "Search every token" }));

    expect(editor.undo).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("leaves Ctrl+Z to the import textarea and the theme name", async () => {
    const editor = makeEditor();
    render(<EditorFrame editor={editor} safeEdit={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Theme options" }));
    await userEvent.click(await screen.findByRole("button", { name: "Import" }));

    pressUndo(screen.getByRole("textbox", { name: "Theme document to import" }));

    expect(editor.undo).not.toHaveBeenCalled();
  });

  it("gives Redo no shortcut", () => {
    const editor = makeEditor();
    render(<EditorFrame editor={editor} safeEdit={false} />);

    fireEvent.keyDown(screen.getByRole("radio", { name: "Visual" }), { key: "z", ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(screen.getByRole("radio", { name: "Visual" }), { key: "y", ctrlKey: true });

    expect(editor.redo).not.toHaveBeenCalled();
    expect(editor.undo).not.toHaveBeenCalled();
  });

  it("opens the export panel from the options menu, closes the menu and closes the panel again", async () => {
    render(<EditorFrame editor={makeEditor()} safeEdit={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Theme options" }));
    await userEvent.click(await screen.findByRole("button", { name: "Export" }));

    expect(screen.getByRole("region", { name: "Export this theme" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Import" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("region", { name: "Export this theme" })).not.toBeInTheDocument();
  });

  it("shows one panel at a time", async () => {
    render(<EditorFrame editor={makeEditor()} safeEdit={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Theme options" }));
    await userEvent.click(await screen.findByRole("button", { name: "Export" }));
    await userEvent.click(screen.getByRole("button", { name: "Theme options" }));
    await userEvent.click(await screen.findByRole("button", { name: "Import" }));

    expect(screen.getByRole("region", { name: "Import a theme" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Export this theme" })).not.toBeInTheDocument();
  });
});
