import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseStoredDraft, THEME_SCOPE_SELECTOR } from "@theme/custom";

import { DRAFT_PERSIST_DELAY_MS, DRAFT_STORAGE_PREFIX } from "../../constants";
import { writeEditor } from "../editorStore";
import { useThemeEditor } from "../useThemeEditor";

const ACCOUNT = "account-1";
const BRAND = "tokens/brand.css";
const NAV = "components/nav.css";
const META = { name: "Mine", scheme: "dark", startedFrom: "dark", follows: [] };

interface FilesAnswer {
  meta: typeof META;
  files: { path: string; text: string; unreadable: boolean }[];
}

const save = vi.fn();
const check = vi.fn();
const fetchFiles = vi.fn();
const themeContext = {
  custom: { folder: "mine" },
  applyDraft: vi.fn(),
  previewing: false,
  startPreview: vi.fn(),
  stopPreview: vi.fn(),
};
let answer: FilesAnswer;

vi.mock("@hooks/api/mutations/theme", () => ({
  useSaveTheme: () => ({ mutateAsync: save }),
  useCheckTheme: () => ({ mutateAsync: check }),
}));

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeFiles: () => ({ data: answer }),
  useThemeFonts: () => ({ data: undefined }),
  useThemeFetchers: () => ({ files: fetchFiles }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { id: ACCOUNT } }),
}));

vi.mock("@theme/ThemeProvider", () => ({
  useThemeContext: () => themeContext,
}));

function answerOf(files: Record<string, string>): FilesAnswer {
  return { meta: META, files: Object.entries(files).map(([path, text]) => ({ path, text, unreadable: false })) };
}

function openEditor() {
  const view = renderHook(() => useThemeEditor());
  const editor = () => {
    const loaded = view.result.current;
    if (loaded === null) throw new Error("the editor did not load");
    return loaded;
  };
  return { editor, rerender: view.rerender, unmount: view.unmount };
}

function storedDraft() {
  return parseStoredDraft(window.localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${ACCOUNT}`));
}

beforeEach(() => {
  vi.useFakeTimers();
  check.mockResolvedValue({ results: [] });
  save.mockResolvedValue({});
  window.localStorage.clear();
});

afterEach(() => {
  writeEditor(null);
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useThemeEditor", () => {
  it("saves only its own change after a save elsewhere added a file and changed one it left alone", async () => {
    answer = answerOf({ [BRAND]: ":root { --a: 1; }", "custom.css": "a {}" });
    const { editor, rerender } = openEditor();
    act(() => editor().change({ ...editor().draft, files: { ...editor().draft.files, [BRAND]: ":root { --a: 2; }" } }));

    answer = answerOf({ [BRAND]: ":root { --a: 1; }", "custom.css": "theirs {}", [NAV]: "n {}" });
    rerender();

    expect(editor().draft.files[NAV]).toBe("n {}");
    expect(editor().draft.files["custom.css"]).toBe("theirs {}");
    expect(editor().conflicts).toEqual([]);

    fetchFiles.mockResolvedValue(answerOf({ [BRAND]: ":root { --a: 2; }", "custom.css": "theirs {}", [NAV]: "n {}" }));
    await act(async () => {
      editor().save();
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({
      files: [{ path: BRAND, text: ":root { --a: 2; }" }],
      remove: [],
      meta: META,
    });
    expect(editor().dirty).toBe(false);
    expect(editor().saved.files[NAV]).toBe("n {}");
  });

  it("keeps, beside the draft it stores in the browser, the saved text of what that draft changed", () => {
    answer = answerOf({ [BRAND]: ":root { --a: 1; }", "custom.css": "a {}" });
    const { editor } = openEditor();
    act(() => editor().change({ ...editor().draft, files: { ...editor().draft.files, [BRAND]: ":root { --a: 2; }" } }));
    act(() => {
      vi.advanceTimersByTime(DRAFT_PERSIST_DELAY_MS);
    });

    expect(storedDraft()?.draft.files[BRAND]).toBe(":root { --a: 2; }");
    expect(storedDraft()?.base).toEqual({ meta: META, files: { [BRAND]: ":root { --a: 1; }" } });
  });

  it("stores the draft again when only the saved theme moved under it", () => {
    answer = answerOf({ [BRAND]: ":root { --a: 1; }" });
    const { editor, rerender } = openEditor();
    act(() => editor().change({ ...editor().draft, files: { [BRAND]: ":root { --a: 2; }" } }));
    act(() => {
      vi.advanceTimersByTime(DRAFT_PERSIST_DELAY_MS);
    });

    answer = answerOf({ [BRAND]: ":root { --a: 3; }" });
    rerender();
    act(() => {
      vi.advanceTimersByTime(DRAFT_PERSIST_DELAY_MS);
    });

    expect(editor().conflicts).toEqual([BRAND]);
    expect(storedDraft()?.base?.files).toEqual({ [BRAND]: ":root { --a: 3; }" });
  });

  it("opens a draft kept in the browser over what the server changed since it was kept", () => {
    answer = answerOf({ [BRAND]: ":root { --a: 1; }", "custom.css": "a {}" });
    const first = openEditor();
    act(() =>
      first.editor().change({
        ...first.editor().draft,
        files: { ...first.editor().draft.files, [BRAND]: ":root { --a: 2; }" },
      })
    );
    act(() => {
      vi.advanceTimersByTime(DRAFT_PERSIST_DELAY_MS);
    });
    first.unmount();
    writeEditor(null);

    answer = answerOf({ [BRAND]: ":root { --a: 1; }", [NAV]: "n {}" });
    const second = openEditor();

    expect(second.editor().restoredAt).not.toBeNull();
    expect(second.editor().draft.files).toEqual({ [BRAND]: ":root { --a: 2; }", [NAV]: "n {}" });
    expect(second.editor().conflicts).toEqual([]);
  });

  it("paints the scheme of the draft, which the saved sheet stops giving while a draft is on screen", () => {
    answer = answerOf({ [BRAND]: ":root { --a: 1; }" });
    const { editor } = openEditor();

    expect(themeContext.applyDraft).toHaveBeenLastCalledWith(
      expect.objectContaining({
        unsaved: false,
        css: expect.stringContaining(`${THEME_SCOPE_SELECTOR}{color-scheme:dark}`),
      })
    );

    act(() => editor().change({ ...editor().draft, meta: { ...editor().draft.meta, scheme: "light" } }));

    expect(themeContext.applyDraft).toHaveBeenLastCalledWith(
      expect.objectContaining({
        unsaved: true,
        css: expect.stringContaining(`${THEME_SCOPE_SELECTOR}{color-scheme:light}`),
      })
    );
  });
});
