import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ThemeEditor } from "../../../types";
import { CssMode } from "../CssMode";
import type { CodeEditorProps } from "../types";
import { diagnosticOf, draftOf, editorOf } from "./fixtures";

const api = vi.hoisted(() => ({
  handle: { insert: vi.fn(), goTo: vi.fn(), focus: vi.fn() },
  files: { data: undefined as { files: { path: string; unreadable: boolean }[] } | undefined },
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

vi.mock("sonner", () => ({ toast: api.toast }));

vi.mock("@theme/ThemeProvider", () => ({ useThemeContext: () => ({ custom: { folder: "account-1" } }) }));

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeFiles: () => api.files,
  useThemeHistory: () => ({ data: undefined }),
  useThemeFetchers: () => ({ version: vi.fn() }),
}));

vi.mock("../components/CodeEditor", async () => {
  const { useImperativeHandle } = await import("react");
  return {
    CodeEditor: ({ ref, path, text, onChange }: CodeEditorProps) => {
      useImperativeHandle(ref, () => api.handle, []);
      return (
        <button type="button" data-testid="code-editor" data-path={path} onClick={() => onChange(`${text}x`)}>
          {path}
        </button>
      );
    },
  };
});

const CLEAN = ":root {\n}\n";

function view(patch: Partial<ThemeEditor["view"]>): ThemeEditor["view"] {
  return { mode: "css", section: "brand", showAll: false, file: "tokens/brand.css", side: null, ...patch };
}

function tree() {
  return screen.getByRole("navigation", { name: "Theme files" });
}

function head() {
  const path = screen.getByText("tokens/brand.css", { selector: "code" });
  if (!path.parentElement) throw new Error("the editor head is missing");
  return within(path.parentElement);
}

beforeEach(() => {
  api.files.data = undefined;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("the file tree", () => {
  it("is headed by the account folder and lists theme.json, the token files, components and custom.css", () => {
    const editor = editorOf({ draft: draftOf({ "components/board.css": "", "custom.css": "" }) });
    render(<CssMode editor={editor} />);

    expect(within(tree()).getByText("/data/theme/account-1/")).toBeInTheDocument();
    const names = within(tree())
      .getAllByRole("button")
      .filter((button) => !button.hasAttribute("data-icon-button"))
      .map((button) => button.textContent)
      .filter((name) => name !== "");
    expect(names.slice(0, 2)).toEqual(["theme.json", "brand.css"]);
    expect(names).toContain("board.css");
    expect(names.at(-2)).toBe("board.css");
    expect(names.at(-1)).toBe("custom.css");
  });

  it("says empty when there are no component files", () => {
    render(<CssMode editor={editorOf()} />);

    expect(within(tree()).getByText("empty")).toBeInTheDocument();
  });

  it("marks the open file with aria-current and opens another through setView", async () => {
    const editor = editorOf();
    render(<CssMode editor={editor} />);

    expect(within(tree()).getByRole("button", { name: "brand.css" })).toHaveAttribute("aria-current", "true");
    expect(within(tree()).getByRole("button", { name: "surfaces.css" })).not.toHaveAttribute("aria-current");

    await userEvent.click(within(tree()).getByRole("button", { name: "surfaces.css" }));

    expect(editor.setView).toHaveBeenCalledWith({ file: "tokens/surfaces.css" });
  });

  it("shows a dot only on the files that differ from the saved draft", () => {
    const saved = draftOf();
    const draft = draftOf({ "tokens/shape.css": ":root { --radius: 1rem; }" });
    render(<CssMode editor={editorOf({ draft, saved })} />);

    const dots = within(tree()).getAllByRole("img", { name: "Not saved" });
    expect(dots).toHaveLength(1);
    expect(within(tree()).getByRole("button", { name: /shape\.css/ })).toContainElement(dots[0]);
  });

  it("marks a broken file in the danger color and no other", () => {
    render(<CssMode editor={editorOf({ broken: ["tokens/text.css"] })} />);

    expect(within(tree()).getByRole("button", { name: "text.css" })).toHaveAttribute("data-broken", "true");
    expect(within(tree()).getByRole("button", { name: "brand.css" })).toHaveAttribute("data-broken", "false");
    expect(within(tree()).getByRole("button", { name: "text.css" }).className).toContain("text-destructive-vivid");
  });

  it("becomes a select above the editor on a phone", () => {
    render(<CssMode editor={editorOf()} />);

    const select = screen.getByRole("button", { name: /File$/ });
    expect(select).toHaveTextContent("tokens/brand.css");
    expect(select.closest("div.md\\:hidden")).not.toBeNull();
    expect(tree().className).toContain("hidden");
  });

  it("falls back to the first token file when the open file is gone from the draft", () => {
    render(<CssMode editor={editorOf({ view: view({ file: "components/gone.css" }) })} />);

    expect(screen.getByTestId("code-editor")).toHaveAttribute("data-path", "tokens/brand.css");
  });
});

describe("component files", () => {
  it("creates an empty file in components and opens it", async () => {
    const editor = editorOf();
    render(<CssMode editor={editor} />);

    await userEvent.click(screen.getByRole("button", { name: "New file in components" }));
    await userEvent.type(screen.getByRole("textbox", { name: "File name" }), "nav-bar");
    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(editor.change).toHaveBeenCalledTimes(1);
    expect(vi.mocked(editor.change).mock.calls[0][0].files["components/nav-bar.css"]).toBe("");
    expect(editor.setView).toHaveBeenCalledWith({ file: "components/nav-bar.css" });
  });

  it("gives the focus back to its button when Escape closes the new file form", async () => {
    const editor = editorOf();
    render(<CssMode editor={editor} />);
    const toggle = screen.getByRole("button", { name: "New file in components" });

    await userEvent.click(toggle);
    await userEvent.type(screen.getByRole("textbox", { name: "File name" }), "nav-bar{Escape}");

    expect(screen.queryByRole("textbox", { name: "File name" })).toBeNull();
    expect(toggle).toHaveFocus();
    expect(editor.change).not.toHaveBeenCalled();
  });

  it("gives the focus back to its button once the file is created with Enter", async () => {
    const editor = editorOf();
    render(<CssMode editor={editor} />);
    const toggle = screen.getByRole("button", { name: "New file in components" });

    await userEvent.click(toggle);
    await userEvent.type(screen.getByRole("textbox", { name: "File name" }), "nav-bar{Enter}");

    expect(editor.change).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("textbox", { name: "File name" })).toBeNull();
    expect(toggle).toHaveFocus();
  });

  it("refuses a name with capitals, spaces or a dot", async () => {
    const editor = editorOf();
    render(<CssMode editor={editor} />);

    await userEvent.click(screen.getByRole("button", { name: "New file in components" }));
    const name = screen.getByRole("textbox", { name: "File name" });
    const create = screen.getByRole("button", { name: "Create" });

    for (const bad of ["Nav", "nav bar", "nav.css"]) {
      await userEvent.clear(name);
      await userEvent.type(name, bad);
      expect(create).toBeDisabled();
    }
    expect(editor.change).not.toHaveBeenCalled();
  });

  it("refuses a duplicate of an existing component file", async () => {
    const editor = editorOf({ draft: draftOf({ "components/board.css": "" }) });
    render(<CssMode editor={editor} />);

    await userEvent.click(screen.getByRole("button", { name: "New file in components" }));
    await userEvent.type(screen.getByRole("textbox", { name: "File name" }), "board");

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("removes a component file from the draft and leaves the open file when it is another", async () => {
    const editor = editorOf({ draft: draftOf({ "components/board.css": "x" }) });
    render(<CssMode editor={editor} />);

    await userEvent.click(within(tree()).getByRole("button", { name: "Delete board.css" }));

    const next = vi.mocked(editor.change).mock.calls[0][0];
    expect(Object.keys(next.files)).not.toContain("components/board.css");
    expect(Object.keys(next.files)).toContain("tokens/brand.css");
    expect(editor.setView).not.toHaveBeenCalled();
  });

  it("moves to the first token file when the open component file is deleted", async () => {
    const editor = editorOf({
      draft: draftOf({ "components/board.css": "x" }),
      view: view({ file: "components/board.css" }),
    });
    render(<CssMode editor={editor} />);

    await userEvent.click(within(tree()).getByRole("button", { name: "Delete board.css" }));

    expect(editor.setView).toHaveBeenCalledWith({ file: "tokens/brand.css" });
  });
});

describe("the editor head", () => {
  it("shows the path and two toggle chips that start released", () => {
    render(<CssMode editor={editorOf()} />);

    expect(screen.getAllByText("tokens/brand.css").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Insert" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "History" })).toHaveAttribute("aria-pressed", "false");
  });

  it("opens one side at a time and closes the open one when pressed again", async () => {
    const editor = editorOf();
    const { rerender } = render(<CssMode editor={editor} />);

    await userEvent.click(head().getByRole("button", { name: "Insert" }));
    expect(editor.setView).toHaveBeenLastCalledWith({ side: "insert" });

    const open = editorOf({ view: view({ side: "insert" }), setView: editor.setView });
    rerender(<CssMode editor={open} />);
    expect(head().getByRole("button", { name: "Insert" })).toHaveAttribute("aria-pressed", "true");
    expect(head().getByRole("button", { name: "History" })).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(head().getByRole("button", { name: "History" }));
    expect(editor.setView).toHaveBeenLastCalledWith({ side: "history" });

    await userEvent.click(head().getByRole("button", { name: "Insert" }));
    expect(editor.setView).toHaveBeenLastCalledWith({ side: null });
  });
});

describe("editing", () => {
  it("sends every document change through editor.change with the open file's text", async () => {
    const editor = editorOf();
    render(<CssMode editor={editor} />);

    await userEvent.click(screen.getByTestId("code-editor"));

    const next = vi.mocked(editor.change).mock.calls[0][0];
    expect(next.files["tokens/brand.css"]).toBe(`${CLEAN}x`);
    expect(next.files["tokens/shape.css"]).toBe(CLEAN);
  });

  it("shows theme.json read-only, with no editor, no problems and no file status", () => {
    render(<CssMode editor={editorOf({ view: view({ file: "theme.json" }) })} />);

    expect(screen.queryByTestId("code-editor")).toBeNull();
    expect(screen.getByRole("region", { name: "theme.json" })).toHaveTextContent('"contract": 1');
    expect(screen.getByText(/Written by Synthseek\. It records which preset/)).toBeInTheDocument();
    expect(screen.queryByText("Saved")).toBeNull();
    expect(screen.queryByText("Not saved")).toBeNull();
  });

  it("warns above the editor when the server could not read the file", () => {
    api.files.data = { files: [{ path: "tokens/brand.css", unreadable: true }] };
    render(<CssMode editor={editorOf()} />);

    expect(screen.getByText(/Synthseek could not read this file/)).toBeInTheDocument();
  });
});

describe("the file status line", () => {
  function checkedWith(...diagnostics: ReturnType<typeof diagnosticOf>[]): ThemeEditor["checked"] {
    return { "tokens/brand.css": { text: CLEAN, diagnostics, css: "" } };
  }

  it("says Saved for a clean file and Not saved for a changed one", () => {
    const saved = draftOf();
    const { rerender } = render(<CssMode editor={editorOf({ checked: checkedWith() })} />);
    expect(screen.getByText("Saved")).toBeInTheDocument();

    const draft = draftOf({ "tokens/brand.css": `${CLEAN}\n` });
    rerender(
      <CssMode
        editor={editorOf({
          draft,
          saved,
          checked: { "tokens/brand.css": { text: `${CLEAN}\n`, diagnostics: [], css: "" } },
        })}
      />
    );
    expect(screen.getByText("Not saved")).toBeInTheDocument();
  });

  it("counts warnings before the saved word", () => {
    const warning = diagnosticOf({ severity: "warning", code: "unknownToken", detail: "--nope" });
    render(<CssMode editor={editorOf({ checked: checkedWith(warning, warning) })} />);

    expect(screen.getByText("2 warnings")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("shows the error count in place of the saved word", () => {
    render(<CssMode editor={editorOf({ checked: checkedWith(diagnosticOf()) })} />);

    expect(screen.getByText("1 syntax error. Save is off until it is fixed.")).toBeInTheDocument();
    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("ignores a check of a different text and shows nothing for it", () => {
    const stale = { "tokens/brand.css": { text: "old", diagnostics: [diagnosticOf()], css: "" } };
    render(<CssMode editor={editorOf({ checked: stale })} />);

    expect(screen.queryByText(/syntax error/)).toBeNull();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("keeps the previous marks while the new check of an edited text has not landed", () => {
    const { rerender } = render(<CssMode editor={editorOf({ checked: checkedWith(diagnosticOf()) })} />);
    expect(screen.getByText(/1 syntax error/)).toBeInTheDocument();

    const edited = draftOf({ "tokens/brand.css": `${CLEAN}x` });
    rerender(<CssMode editor={editorOf({ draft: edited, checked: checkedWith(diagnosticOf()) })} />);

    expect(screen.getByText(/1 syntax error/)).toBeInTheDocument();
  });

  it("links to the token reference", () => {
    render(<CssMode editor={editorOf()} />);

    expect(screen.getByRole("link", { name: "Token reference" })).toHaveAttribute(
      "href",
      "https://docs.synthseek.dev/custom-themes/#tokens"
    );
  });
});

describe("the problems list", () => {
  function many(count: number) {
    return Array.from({ length: count }, (_, index) => diagnosticOf({ line: index + 1, column: 1 }));
  }

  it("lists at most four problems and then how many more", () => {
    const checked = { "tokens/brand.css": { text: CLEAN, diagnostics: many(6), css: "" } };
    render(<CssMode editor={editorOf({ checked })} />);

    expect(screen.getAllByRole("button", { name: /^Line \d/ })).toHaveLength(4);
    expect(screen.getByText("and 2 more")).toBeInTheDocument();
  });

  it("writes each message from its code and detail", () => {
    const checked = {
      "tokens/brand.css": {
        text: CLEAN,
        diagnostics: [diagnosticOf({ code: "syntax", detail: "Unclosed block" })],
        css: "",
      },
    };
    render(<CssMode editor={editorOf({ checked })} />);

    expect(screen.getByRole("button", { name: "Line 2 Syntax error: Unclosed block" })).toBeInTheDocument();
  });

  it("moves the cursor to the problem when it is pressed", async () => {
    const checked = { "tokens/brand.css": { text: CLEAN, diagnostics: many(2), css: "" } };
    render(<CssMode editor={editorOf({ checked })} />);

    await userEvent.click(screen.getByRole("button", { name: /^Line 2/ }));

    expect(api.handle.goTo).toHaveBeenCalledWith(2, 1);
  });

  it("shows nothing when the file has no problems", () => {
    render(<CssMode editor={editorOf()} />);

    expect(screen.queryByRole("button", { name: /^Line \d/ })).toBeNull();
  });
});

describe("the disk notice", () => {
  it("shows above the editor only for a file that changed on disk", () => {
    const { rerender } = render(<CssMode editor={editorOf({ conflicts: ["tokens/shape.css"] })} />);
    expect(screen.queryByText("This file changed on disk while you were editing.")).toBeNull();

    rerender(<CssMode editor={editorOf({ conflicts: ["tokens/brand.css"] })} />);
    expect(screen.getByText("This file changed on disk while you were editing.")).toBeInTheDocument();
  });

  it("reloads from disk or keeps the user's text for the open file", async () => {
    const editor = editorOf({ conflicts: ["tokens/brand.css"] });
    render(<CssMode editor={editor} />);

    await userEvent.click(screen.getByRole("button", { name: "Reload from disk" }));
    expect(editor.takeTheirs).toHaveBeenCalledWith("tokens/brand.css");
    expect(editor.keepMine).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Keep mine" }));
    expect(editor.keepMine).toHaveBeenCalledWith("tokens/brand.css");
  });
});

describe("the Insert column", () => {
  function item(text: string): HTMLElement {
    const found = screen.getAllByRole("button").find((button) => button.getAttribute("title") === text);
    if (found === undefined) throw new Error(`no insert item for ${text}`);
    return found;
  }

  it("inserts a token as var() and hands the cursor to the editor", async () => {
    render(<CssMode editor={editorOf({ view: view({ side: "insert" }) })} />);

    await userEvent.click(item("var(--color-primary-500)"));

    expect(api.handle.insert).toHaveBeenCalledWith({
      text: "var(--color-primary-500)",
      cursor: "var(--color-primary-500)".length,
    });
  });

  it("inserts a part as a block with the cursor inside the braces", async () => {
    render(<CssMode editor={editorOf({ view: view({ side: "insert" }) })} />);

    await userEvent.click(item('[data-part="widget"] {\n  \n}'));

    const [{ text, cursor }] = api.handle.insert.mock.calls[0];
    expect(text.slice(0, cursor)).toBe('[data-part="widget"] {\n  ');
  });

  it("narrows the list with the chips and the search box", async () => {
    render(<CssMode editor={editorOf({ view: view({ side: "insert" }) })} />);

    await userEvent.click(screen.getByRole("button", { name: "Snippets" }));
    expect(screen.getByRole("button", { name: "Snippets" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByTitle("var(--color-primary-500)")).toBeNull();

    await userEvent.type(screen.getByRole("searchbox", { name: "Search" }), "no-such-thing");
    expect(screen.getByText("Nothing matches.")).toBeInTheDocument();
  });

  it("says to open a CSS file when theme.json is open", async () => {
    render(<CssMode editor={editorOf({ view: view({ file: "theme.json", side: "insert" }) })} />);

    await userEvent.click(item("var(--color-primary-500)"));

    expect(api.handle.insert).not.toHaveBeenCalled();
    expect(api.toast).toHaveBeenCalledWith("Open a CSS file to insert into.");
  });
});
