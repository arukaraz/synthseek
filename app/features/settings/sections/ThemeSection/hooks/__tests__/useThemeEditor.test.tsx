import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseStoredDraft, THEME_SCOPE_SELECTOR } from "@theme/custom";

import { DRAFT_CHECK_DELAY_MS, DRAFT_PERSIST_DELAY_MS, DRAFT_STORAGE_PREFIX } from "../../constants";
import type { ThemeFontList } from "../../types";
import { writeEditor } from "../editorStore";
import { useThemeEditor } from "../useThemeEditor";

const ACCOUNT = "account-1";
const BRAND = "tokens/brand.css";
const NAV = "components/nav.css";
const SHAPE = "tokens/shape.css";
const META = { name: "Mine", scheme: "dark", startedFrom: "dark", follows: [] };

const CHANGED_ELSEWHERE = { data: { appCode: "THEME_CHANGED_ELSEWHERE" } };
const SETTLE_TURNS = 16;

interface FilesAnswer {
  meta: typeof META;
  files: { path: string; text: string; unreadable: boolean; leftOut: boolean }[];
  revision: string;
}

const save = vi.fn();
const check = vi.fn();
const fetchFiles = vi.fn();
const errorToast = vi.hoisted(() => vi.fn());
const themeContext = {
  custom: { folder: "mine" },
  applyDraft: vi.fn(),
  previewing: false,
  startPreview: vi.fn(),
  stopPreview: vi.fn(),
};
let answer: FilesAnswer;
let fontsAnswer: ThemeFontList | undefined;

vi.mock("@hooks/api/mutations/theme", async () => {
  const helpers = await vi.importActual<typeof import("@hooks/api/mutations/theme/helpers")>(
    "@hooks/api/mutations/theme/helpers"
  );
  return {
    isThemeChangedElsewhere: helpers.isThemeChangedElsewhere,
    useSaveTheme: () => ({ mutateAsync: save }),
    useCheckTheme: () => ({ mutateAsync: check }),
  };
});

vi.mock("@modules/errors", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@modules/errors")>()),
  errorToast,
}));

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeFiles: () => ({ data: answer }),
  useThemeFonts: () => ({ data: fontsAnswer }),
  useThemeFetchers: () => ({ files: fetchFiles }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { id: ACCOUNT } }),
}));

vi.mock("@theme/ThemeProvider", () => ({
  useThemeContext: () => themeContext,
}));

function answerOf(files: Record<string, string>, revision = "r1", leftOut: readonly string[] = []): FilesAnswer {
  return {
    meta: META,
    files: Object.entries(files).map(([path, text]) => ({
      path,
      text,
      unreadable: false,
      leftOut: leftOut.includes(path),
    })),
    revision,
  };
}

type OpenedEditor = ReturnType<typeof openEditor>["editor"];

async function pressSave(editor: OpenedEditor) {
  await act(async () => {
    editor().save();
    for (let turn = 0; turn < SETTLE_TURNS; turn += 1) await Promise.resolve();
  });
}

function withText(editor: OpenedEditor, path: string, text: string) {
  act(() => editor().change({ ...editor().draft, files: { ...editor().draft.files, [path]: text } }));
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
  fontsAnswer = undefined;
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
      base: "r1",
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

describe("saving from the state the editor read", () => {
  const START = { [BRAND]: ":root { --a: 1; }", "custom.css": "a {}" };
  const MINE = ":root { --a: 2; }";

  it("sends the revision of the theme it read, then the one its own save left", async () => {
    answer = answerOf(START, "r1");
    const { editor } = openEditor();
    withText(editor, BRAND, MINE);
    fetchFiles.mockResolvedValueOnce(answerOf({ ...START, [BRAND]: MINE }, "r2"));

    await pressSave(editor);
    withText(editor, "custom.css", "b {}");
    fetchFiles.mockResolvedValueOnce(answerOf({ [BRAND]: MINE, "custom.css": "b {}" }, "r3"));
    await pressSave(editor);

    expect(save.mock.calls.map(([input]) => input.base)).toEqual(["r1", "r2"]);
    expect(editor().dirty).toBe(false);
  });

  it("sends the revision of a change made elsewhere once it has taken it", async () => {
    answer = answerOf(START, "r1");
    const { editor, rerender } = openEditor();
    withText(editor, BRAND, MINE);
    answer = answerOf({ ...START, [NAV]: "n {}" }, "r2");
    rerender();
    fetchFiles.mockResolvedValueOnce(answerOf({ ...START, [BRAND]: MINE, [NAV]: "n {}" }, "r3"));

    await pressSave(editor);

    expect(save.mock.calls.map(([input]) => input.base)).toEqual(["r2"]);
  });

  it("merges what changed and saves again by itself when the theme moved before its save arrived", async () => {
    answer = answerOf(START, "r1");
    const { editor } = openEditor();
    withText(editor, BRAND, MINE);
    save.mockRejectedValueOnce(CHANGED_ELSEWHERE).mockResolvedValueOnce({});
    fetchFiles
      .mockResolvedValueOnce(answerOf({ ...START, "custom.css": "theirs {}" }, "r2"))
      .mockResolvedValueOnce(answerOf({ [BRAND]: MINE, "custom.css": "theirs {}" }, "r3"));

    await pressSave(editor);

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({
      base: "r2",
      files: [{ path: BRAND, text: MINE }],
      remove: [],
      meta: META,
    });
    expect(errorToast).not.toHaveBeenCalled();
    expect(editor().saved.files["custom.css"]).toBe("theirs {}");
    expect(editor().dirty).toBe(false);
    expect(editor().saving).toBe(false);
  });

  it("stops, keeps the draft and says so when what changed is the file it was saving", async () => {
    answer = answerOf(START, "r1");
    const { editor } = openEditor();
    withText(editor, "custom.css", "mine {}");
    save.mockRejectedValueOnce(CHANGED_ELSEWHERE);
    fetchFiles.mockResolvedValueOnce(answerOf({ ...START, "custom.css": "theirs {}" }, "r2"));

    await pressSave(editor);

    expect(save).toHaveBeenCalledTimes(1);
    expect(errorToast).toHaveBeenCalledTimes(1);
    expect(errorToast).toHaveBeenCalledWith(CHANGED_ELSEWHERE, "theme.saveFailed");
    expect(editor().conflicts).toEqual(["custom.css"]);
    expect(editor().draft.files["custom.css"]).toBe("mine {}");
    expect(editor().dirty).toBe(true);
    expect(editor().saving).toBe(false);

    fetchFiles.mockResolvedValueOnce(answerOf({ ...START, "custom.css": "mine {}" }, "r3"));
    await pressSave(editor);

    expect(save).toHaveBeenLastCalledWith({
      base: "r2",
      files: [{ path: "custom.css", text: "mine {}" }],
      remove: [],
      meta: META,
    });
    expect(editor().dirty).toBe(false);
  });

  it("tries again once only, and stays on the newest state it read", async () => {
    answer = answerOf(START, "r1");
    const { editor } = openEditor();
    withText(editor, BRAND, MINE);
    save.mockRejectedValueOnce(CHANGED_ELSEWHERE).mockRejectedValueOnce(CHANGED_ELSEWHERE);
    fetchFiles
      .mockResolvedValueOnce(answerOf({ ...START, [NAV]: "n {}" }, "r2"))
      .mockResolvedValueOnce(answerOf({ ...START, [NAV]: "n2 {}" }, "r3"));

    await pressSave(editor);

    expect(save.mock.calls.map(([input]) => input.base)).toEqual(["r1", "r2"]);
    expect(errorToast).toHaveBeenCalledTimes(1);
    expect(editor().saved.files[NAV]).toBe("n2 {}");
    expect(editor().draft.files[BRAND]).toBe(MINE);
    expect(editor().dirty).toBe(true);
    expect(editor().saving).toBe(false);
  });

  it("has nothing left to save when the change elsewhere was the same change", async () => {
    answer = answerOf(START, "r1");
    const { editor } = openEditor();
    withText(editor, BRAND, MINE);
    save.mockRejectedValueOnce(CHANGED_ELSEWHERE);
    fetchFiles.mockResolvedValueOnce(answerOf({ ...START, [BRAND]: MINE }, "r2"));

    await pressSave(editor);

    expect(save).toHaveBeenCalledTimes(1);
    expect(errorToast).not.toHaveBeenCalled();
    expect(editor().dirty).toBe(false);
  });

  it("keeps the draft and reads nothing again when the save fails for another reason", async () => {
    answer = answerOf(START, "r1");
    const { editor } = openEditor();
    withText(editor, BRAND, MINE);
    save.mockRejectedValueOnce(new Error("offline"));

    await pressSave(editor);

    expect(save).toHaveBeenCalledTimes(1);
    expect(fetchFiles).not.toHaveBeenCalled();
    expect(errorToast).not.toHaveBeenCalled();
    expect(editor().dirty).toBe(true);
    expect(editor().saving).toBe(false);
  });
});

describe("files the server left out of the theme", () => {
  it("names them, and nothing when every file is applied", () => {
    answer = answerOf({ [BRAND]: ":root { --a: 1; }", [NAV]: "n {}" }, "r1", [NAV]);
    const { editor, rerender } = openEditor();

    expect(editor().leftOut).toEqual([NAV]);

    answer = answerOf({ [BRAND]: ":root { --a: 1; }", [NAV]: "n {}" }, "r2");
    rerender();

    expect(editor().leftOut).toEqual([]);
  });

  it("declares in the draft's sheet the fonts the server applies and not the one it left out", () => {
    answer = answerOf({ [BRAND]: ":root { --a: 1; }" });
    fontsAnswer = {
      fonts: [
        { file: "Inter.woff2", bytes: 2048, leftOut: false },
        { file: "Heavy.woff2", bytes: 5242880, leftOut: true },
      ],
      usedBytes: 5244928,
      maxBytes: 5242880,
    };
    openEditor();

    const [{ css }] = themeContext.applyDraft.mock.calls[themeContext.applyDraft.mock.calls.length - 1];

    expect(css).toContain("Inter.woff2");
    expect(css).not.toContain("Heavy.woff2");
  });

  it("paints in the draft's sheet neither a token file nor a free file the server left out", async () => {
    answer = answerOf(
      { [BRAND]: ":root { --a: 1; }", [SHAPE]: ":root { --b: 2; }", [NAV]: "n {}", "custom.css": "c {}" },
      "r1",
      [SHAPE, NAV]
    );
    check.mockResolvedValue({
      results: [
        { path: NAV, diagnostics: [], css: "n-scoped {}" },
        { path: "custom.css", diagnostics: [], css: "c-scoped {}" },
      ],
    });
    openEditor();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DRAFT_CHECK_DELAY_MS);
    });

    const [{ css }] = themeContext.applyDraft.mock.calls[themeContext.applyDraft.mock.calls.length - 1];

    expect(css).toContain("--a:1");
    expect(css).toContain("c-scoped {}");
    expect(css).not.toContain("--b:2");
    expect(css).not.toContain("n-scoped {}");
  });
});
