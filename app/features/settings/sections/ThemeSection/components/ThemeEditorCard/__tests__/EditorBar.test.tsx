import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeDraft, makeEditor } from "../../../__tests__/fixtures";
import { EditorBar } from "../EditorBar";

const push = vi.fn();
const toastSuccess = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args), error: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditorBar", () => {
  it("is a toolbar named for the theme editor", () => {
    render(<EditorBar editor={makeEditor()} />);

    expect(screen.getByRole("toolbar", { name: "Theme editor" })).toBeInTheDocument();
  });

  it("says everything is saved when nothing changed", () => {
    render(<EditorBar editor={makeEditor()} />);

    expect(screen.getByText("All changes saved.")).toBeInTheDocument();
  });

  it("says there are unsaved changes when the draft is dirty", () => {
    render(<EditorBar editor={makeEditor({ dirty: true })} />);

    expect(screen.getByText("Unsaved changes.")).toBeInTheDocument();
  });

  it("says it is saving while a save is in flight", () => {
    render(<EditorBar editor={makeEditor({ dirty: true, saving: true })} />);

    expect(screen.getByText("Saving your theme.")).toBeInTheDocument();
  });

  it("names the broken file and turns Save off", () => {
    render(<EditorBar editor={makeEditor({ dirty: true, broken: ["custom.css"] })} />);

    expect(screen.getByText("Save is off.")).toBeInTheDocument();
    expect(screen.getByText(/Fix the syntax error in custom\.css\./)).toBeInTheDocument();
  });

  it("counts the other broken files", () => {
    render(
      <EditorBar editor={makeEditor({ dirty: true, broken: ["custom.css", "components/a.css", "components/b.css"] })} />
    );

    expect(screen.getByText(/Fix the syntax error in custom\.css and 2 more files\./)).toBeInTheDocument();
  });

  it("keeps Save off when the draft is clean", () => {
    render(<EditorBar editor={makeEditor({ dirty: false })} />);

    expect(screen.getByRole("button", { name: "Save theme" })).toBeDisabled();
  });

  it("keeps Save off while a file is broken", () => {
    render(<EditorBar editor={makeEditor({ dirty: true, broken: ["custom.css"] })} />);

    expect(screen.getByRole("button", { name: "Save theme" })).toBeDisabled();
  });

  it("keeps Save off while saving", () => {
    render(<EditorBar editor={makeEditor({ dirty: true, saving: true })} />);

    expect(screen.getByRole("button", { name: "Save theme" })).toBeDisabled();
  });

  it("saves when the draft is dirty and healthy", async () => {
    const editor = makeEditor({ dirty: true });
    render(<EditorBar editor={editor} />);

    await userEvent.click(screen.getByRole("button", { name: "Save theme" }));

    expect(editor.save).toHaveBeenCalledTimes(1);
  });

  it("discards through the editor and says so", async () => {
    const editor = makeEditor({ dirty: true });
    render(<EditorBar editor={editor} />);

    await userEvent.click(screen.getByRole("button", { name: "Discard" }));

    expect(editor.discard).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("Changes discarded.");
  });

  it("keeps Discard off while nothing changed", () => {
    render(<EditorBar editor={makeEditor({ dirty: false })} />);

    expect(screen.getByRole("button", { name: "Discard" })).toBeDisabled();
  });

  it("undoes and redoes only when the log allows it", async () => {
    const editor = makeEditor({ canUndo: true, canRedo: false });
    render(<EditorBar editor={editor} />);

    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(editor.undo).toHaveBeenCalledTimes(1);
    expect(editor.redo).not.toHaveBeenCalled();
  });

  it("starts the preview and goes to the app's home", async () => {
    const editor = makeEditor();
    render(<EditorBar editor={editor} />);

    await userEvent.click(screen.getByRole("button", { name: "Preview in the app" }));

    expect(editor.startPreview).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/");
  });

  it("announces a save that went through at the top of the screen", () => {
    const before = makeEditor({ dirty: true });
    const { rerender } = render(<EditorBar editor={before} />);

    fireEvent.click(screen.getByRole("button", { name: "Save theme" }));
    rerender(<EditorBar editor={{ ...before, saving: true }} />);
    rerender(<EditorBar editor={{ ...before, saving: false, dirty: false, saved: makeDraft({ name: "Saved" }) }} />);

    expect(toastSuccess).toHaveBeenCalledWith("Theme saved. Your other devices pick it up.", {
      position: "top-center",
    });
  });

  it("stays quiet when the save failed and the saved theme did not move", () => {
    const before = makeEditor({ dirty: true });
    const { rerender } = render(<EditorBar editor={before} />);

    fireEvent.click(screen.getByRole("button", { name: "Save theme" }));
    rerender(<EditorBar editor={{ ...before, saving: true }} />);
    rerender(<EditorBar editor={{ ...before, saving: false }} />);

    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
