import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { colorOf, makeDraft, makeEditor, tokenFile } from "../../../__tests__/fixtures";
import { ExportPanel } from "../ExportPanel";

const toastSuccess = vi.fn();
const toastError = vi.fn();
const downloadText = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("@utils/download", () => ({
  downloadText: (...args: unknown[]) => downloadText(...args),
}));

const draft = makeDraft(
  { name: "My Theme!" },
  {
    "tokens/brand.css": tokenFile("--color-primary-500", colorOf(0.6, 0.2, 250)),
    "components/nav.css": '[data-part="top-header"] {\n  opacity: 0.9;\n}\n',
    "custom.css": '[data-part="brand"] {\n  opacity: 1;\n}\n',
  }
);

function documentIn(field: HTMLElement): { files: Record<string, string>; name: string } {
  return JSON.parse((field as HTMLTextAreaElement).value);
}

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ExportPanel", () => {
  it("shows the whole theme document, free CSS included, read-only", () => {
    render(<ExportPanel editor={makeEditor({ draft })} />);

    const field = screen.getByRole("textbox", { name: "Theme document" });

    expect(field).toHaveAttribute("readonly");
    expect(Object.keys(documentIn(field).files).sort()).toEqual([
      "components/nav.css",
      "custom.css",
      "tokens/brand.css",
    ]);
  });

  it("drops the free CSS from the document when the checkbox is cleared", async () => {
    render(<ExportPanel editor={makeEditor({ draft })} />);

    await userEvent.click(screen.getByRole("checkbox", { name: /Include my free CSS/ }));

    expect(Object.keys(documentIn(screen.getByRole("textbox", { name: "Theme document" })).files)).toEqual([
      "tokens/brand.css",
    ]);
  });

  it("writes the typed name into the draft, up to 60 characters", () => {
    const editor = makeEditor({ draft });
    render(<ExportPanel editor={editor} />);

    const name = screen.getByRole("textbox", { name: "Theme name" });
    fireEvent.change(name, { target: { value: "Sunset" } });

    expect(name).toHaveAttribute("maxlength", "60");
    expect(editor.change).toHaveBeenCalledWith({ ...draft, meta: { ...draft.meta, name: "Sunset" } });
  });

  it("copies the document and says so", async () => {
    render(<ExportPanel editor={makeEditor({ draft })} />);

    await userEvent.click(screen.getByRole("button", { name: "Copy JSON" }));

    const field = screen.getByRole("textbox", { name: "Theme document" }) as HTMLTextAreaElement;
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(field.value);
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Theme copied as JSON."));
  });

  it("selects the text and says to copy it by hand when the clipboard refuses", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    render(<ExportPanel editor={makeEditor({ draft })} />);

    await userEvent.click(screen.getByRole("button", { name: "Copy JSON" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Select all and copy the text in the box."));
    expect(screen.getByRole("textbox", { name: "Theme document" })).toHaveFocus();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("downloads the document under the theme's name, lower-case with dashes", async () => {
    render(<ExportPanel editor={makeEditor({ draft })} />);

    await userEvent.click(screen.getByRole("button", { name: "Download .json" }));

    const field = screen.getByRole("textbox", { name: "Theme document" }) as HTMLTextAreaElement;
    expect(downloadText).toHaveBeenCalledWith("my-theme.json", field.value);
  });

  it("falls back to a plain file name for a blank theme name", async () => {
    render(<ExportPanel editor={makeEditor({ draft: makeDraft({ name: "  " }) })} />);

    await userEvent.click(screen.getByRole("button", { name: "Download .json" }));

    expect(downloadText).toHaveBeenCalledWith("theme.json", expect.any(String));
  });
});
