// @vitest-environment node
import { describe, expect, it } from "vitest";

import { UNDO_GROUP_MS } from "../constants";
import { changedPaths, removedPaths } from "../draft";
import {
  adoptSaved,
  discardSession,
  editSession,
  isDirty,
  keepMine,
  openSession,
  parseStoredDraft,
  redoSession,
  serializeStoredDraft,
  takeTheirs,
  undoSession,
} from "../session";
import type { ThemeDraft } from "../types";
import { canUndo } from "../undo";

import { presetDraft } from "./fixtures";

const STEP = UNDO_GROUP_MS + 1;

const NAV = "components/nav.css";

function withFile(draft: ThemeDraft, path: string, text: string): ThemeDraft {
  return { ...draft, files: { ...draft.files, [path]: text } };
}

function withoutFile(draft: ThemeDraft, path: string): ThemeDraft {
  return { ...draft, files: Object.fromEntries(Object.entries(draft.files).filter(([name]) => name !== path)) };
}

function withMeta(draft: ThemeDraft, meta: Partial<ThemeDraft["meta"]>): ThemeDraft {
  return { ...draft, meta: { ...draft.meta, ...meta } };
}

describe("openSession", () => {
  it("opens on the saved theme when the browser kept no draft", () => {
    const saved = presetDraft();
    const session = openSession(saved, null);
    expect(session.draft).toBe(saved);
    expect(session.restoredAt).toBeNull();
    expect(isDirty(session)).toBe(false);
    expect(canUndo(session.undo)).toBe(false);
  });

  it("restores a kept draft that differs from the saved theme and says when it was kept", () => {
    const saved = presetDraft();
    const kept = withFile(saved, "custom.css", "a { color: red }");
    const session = openSession(saved, { at: 1234, draft: kept });
    expect(session.draft).toBe(kept);
    expect(session.restoredAt).toBe(1234);
    expect(isDirty(session)).toBe(true);
  });

  it("drops a kept draft that already matches the saved theme", () => {
    const session = openSession(presetDraft(), { at: 1234, draft: presetDraft() });
    expect(session.restoredAt).toBeNull();
    expect(isDirty(session)).toBe(false);
  });

  it("carries into a kept draft what the server changed since, in the files that draft left alone", () => {
    const before = withFile(withFile(presetDraft(), "custom.css", "a {}"), "components/x.css", "x {}");
    const kept = withFile(before, "custom.css", "mine {}");
    const now = withFile(withFile(withoutFile(before, "tokens/brand.css"), "components/x.css", "x2 {}"), NAV, "n {}");
    const session = openSession(now, parseStoredDraft(serializeStoredDraft(kept, before, 5)));
    expect(session.draft.files["custom.css"]).toBe("mine {}");
    expect(session.draft.files["components/x.css"]).toBe("x2 {}");
    expect(session.draft.files[NAV]).toBe("n {}");
    expect(Object.hasOwn(session.draft.files, "tokens/brand.css")).toBe(false);
    expect(changedPaths(session.saved, session.draft)).toEqual(["custom.css"]);
    expect(removedPaths(session.saved, session.draft)).toEqual([]);
    expect(session.conflicts).toEqual([]);
    expect(session.restoredAt).toBe(5);
  });

  it("names the file a kept draft and the server both changed, and keeps the draft's text", () => {
    const before = withFile(presetDraft(), "custom.css", "a {}");
    const kept = withFile(before, "custom.css", "mine {}");
    const now = withFile(before, "custom.css", "theirs {}");
    const session = openSession(now, parseStoredDraft(serializeStoredDraft(kept, before, 5)));
    expect(session.draft.files["custom.css"]).toBe("mine {}");
    expect(session.conflicts).toEqual(["custom.css"]);
  });

  it("raises no notice for a file a kept draft and the server ended on with the same text", () => {
    const before = withFile(presetDraft(), "custom.css", "a {}");
    const kept = withFile(withFile(before, "custom.css", "same {}"), NAV, "mine {}");
    const now = withFile(before, "custom.css", "same {}");
    const session = openSession(now, parseStoredDraft(serializeStoredDraft(kept, before, 5)));
    expect(session.conflicts).toEqual([]);
    expect(changedPaths(session.saved, session.draft)).toEqual([NAV]);
  });

  it("keeps deleted a file a kept draft deleted that the server left alone", () => {
    const before = withFile(presetDraft(), "custom.css", "a {}");
    const kept = withoutFile(before, "custom.css");
    const now = withFile(before, NAV, "n {}");
    const session = openSession(now, parseStoredDraft(serializeStoredDraft(kept, before, 5)));
    expect(Object.hasOwn(session.draft.files, "custom.css")).toBe(false);
    expect(session.draft.files[NAV]).toBe("n {}");
    expect(removedPaths(session.saved, session.draft)).toEqual(["custom.css"]);
    expect(session.conflicts).toEqual([]);
  });

  it("drops a kept draft once the server holds everything it changed", () => {
    const before = withFile(presetDraft(), "custom.css", "a {}");
    const kept = withFile(before, "custom.css", "same {}");
    const now = withFile(withFile(before, "custom.css", "same {}"), NAV, "n {}");
    const session = openSession(now, parseStoredDraft(serializeStoredDraft(kept, before, 5)));
    expect(session.draft).toBe(now);
    expect(session.restoredAt).toBeNull();
    expect(session.conflicts).toEqual([]);
    expect(isDirty(session)).toBe(false);
  });
});

describe("the stored draft", () => {
  it("survives a round trip through the browser's storage, with the saved text of what it changed", () => {
    const saved = withFile(presetDraft("ocean"), "custom.css", "a {}");
    const draft = withFile(withoutFile(withFile(saved, "custom.css", "mine {}"), "tokens/brand.css"), NAV, "b {}");
    expect(parseStoredDraft(serializeStoredDraft(draft, saved, 77))).toEqual({
      at: 77,
      draft,
      base: {
        meta: saved.meta,
        files: { "custom.css": "a {}", [NAV]: null, "tokens/brand.css": saved.files["tokens/brand.css"] },
      },
    });
  });

  it("still reads a draft kept before the saved text was stored beside it", () => {
    const draft = withFile(presetDraft(), "custom.css", "mine {}");
    expect(parseStoredDraft(JSON.stringify({ at: 3, draft }))).toEqual({ at: 3, draft });
  });

  it("is ignored when the stored text is not a draft", () => {
    expect(parseStoredDraft(null)).toBeNull();
    expect(parseStoredDraft("{")).toBeNull();
    expect(parseStoredDraft(JSON.stringify({ at: 1, draft: { meta: {}, files: {} } }))).toBeNull();
    expect(parseStoredDraft(JSON.stringify({ at: "1", draft: presetDraft() }))).toBeNull();
  });
});

describe("undo and redo over the whole draft", () => {
  it("walks back one edit at a time and forward again", () => {
    const saved = presetDraft();
    const first = withFile(saved, "custom.css", "a {}");
    const second = withFile(first, "custom.css", "b {}");
    let session = openSession(saved, null);
    session = editSession(session, first, STEP);
    session = editSession(session, second, STEP * 2);
    session = undoSession(session);
    expect(session.draft).toEqual(first);
    session = undoSession(session);
    expect(session.draft).toEqual(saved);
    expect(undoSession(session)).toBe(session);
    session = redoSession(session);
    expect(session.draft).toEqual(first);
    session = redoSession(session);
    expect(session.draft).toEqual(second);
    expect(redoSession(session)).toBe(session);
  });

  it("makes a discard one step that undo brings back", () => {
    const saved = presetDraft();
    const edited = withFile(saved, "custom.css", "a {}");
    let session = editSession(openSession(saved, { at: 5, draft: edited }), edited, STEP);
    session = discardSession(session, STEP * 2);
    expect(isDirty(session)).toBe(false);
    expect(session.restoredAt).toBeNull();
    expect(undoSession(session).draft).toEqual(edited);
  });
});

describe("adoptSaved", () => {
  it("takes what the server stored after this editor's own save, cleaned text included", () => {
    const saved = presetDraft();
    const edited = withFile(saved, "custom.css", "@import url(http://x); a {}");
    const stored = withFile(saved, "custom.css", "a {}");
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), stored, edited, STEP * 2);
    expect(session.saved).toBe(stored);
    expect(session.draft).toBe(stored);
    expect(isDirty(session)).toBe(false);
    expect(undoSession(session).draft).toEqual(edited);
  });

  it("adds no undo step when the server stored exactly the draft", () => {
    const saved = presetDraft();
    const edited = withFile(saved, "custom.css", "a {}");
    const before = editSession(openSession(saved, null), edited, STEP);
    const after = adoptSaved(before, withFile(presetDraft(), "custom.css", "a {}"), edited, STEP * 2);
    expect(after.undo).toBe(before.undo);
    expect(isDirty(after)).toBe(false);
  });

  it("keeps what was typed after pressing Save and raises no notice for the file just saved", () => {
    const saved = presetDraft();
    const sent = withFile(saved, "custom.css", "a {}");
    const later = withFile(sent, "custom.css", "a {} b {}");
    let session = editSession(openSession(saved, { at: 9, draft: sent }), sent, STEP);
    session = editSession(session, later, STEP * 2);
    session = adoptSaved(session, withFile(presetDraft(), "custom.css", "a {}"), sent, STEP * 3);
    expect(session.draft).toBe(later);
    expect(session.conflicts).toEqual([]);
    expect(session.restoredAt).toBeNull();
    expect(isDirty(session)).toBe(true);
  });

  it("takes the text the server cleaned on save into a draft that moved on in another file, as a step undo reverses", () => {
    const saved = presetDraft();
    const sent = withFile(saved, "custom.css", "@import url(http://x); a {}");
    const later = withFile(sent, NAV, "n {}");
    let session = editSession(openSession(saved, null), sent, STEP);
    session = editSession(session, later, STEP * 2);
    session = adoptSaved(session, withFile(presetDraft(), "custom.css", "a {}"), sent, STEP * 3);
    expect(session.draft.files["custom.css"]).toBe("a {}");
    expect(session.draft.files[NAV]).toBe("n {}");
    expect(session.conflicts).toEqual([]);
    expect(undoSession(session).draft).toEqual(later);
  });

  it("names a file the server cleaned on save when more was typed in it after pressing Save", () => {
    const saved = presetDraft();
    const sent = withFile(saved, "custom.css", "@import url(http://x); a {}");
    const later = withFile(sent, "custom.css", "@import url(http://x); a {} b {}");
    let session = editSession(openSession(saved, null), sent, STEP);
    session = editSession(session, later, STEP * 2);
    session = adoptSaved(session, withFile(presetDraft(), "custom.css", "a {}"), sent, STEP * 3);
    expect(session.draft).toBe(later);
    expect(session.conflicts).toEqual(["custom.css"]);
  });

  it("carries a file added elsewhere that arrives with this editor's own save, and no undo step drops it", () => {
    const saved = withFile(presetDraft(), "custom.css", "a {}");
    const sent = withFile(saved, "custom.css", "mine {}");
    const stored = { ...sent, files: { [NAV]: "n {}", ...sent.files } };
    const session = adoptSaved(editSession(openSession(saved, null), sent, STEP), stored, sent, STEP * 2);
    expect(session.draft.files[NAV]).toBe("n {}");
    expect(isDirty(session)).toBe(false);
    const undone = undoSession(session);
    expect(undone.draft.files["custom.css"]).toBe("a {}");
    expect(undone.draft.files[NAV]).toBe("n {}");
    expect(undoSession(undone)).toBe(undone);
  });

  it("follows the name the server stored on save without an undo step of its own", () => {
    const saved = withMeta(presetDraft(), { name: "Old" });
    const sent = withMeta(saved, { name: "New  " });
    const stored = withMeta(saved, { name: "New" });
    const session = adoptSaved(editSession(openSession(saved, null), sent, STEP), stored, sent, STEP * 2);
    expect(session.draft.meta.name).toBe("New");
    expect(isDirty(session)).toBe(false);
    expect(undoSession(session).draft.meta.name).toBe("Old");
  });

  it("follows a change made elsewhere while the draft has nothing unsaved, and adds no undo step for it", () => {
    const saved = presetDraft();
    const remote = withFile(saved, "custom.css", "c {}");
    const session = adoptSaved(openSession(saved, null), remote, null, STEP);
    expect(session.draft).toBe(remote);
    expect(session.conflicts).toEqual([]);
    expect(isDirty(session)).toBe(false);
    expect(canUndo(session.undo)).toBe(false);
  });

  it("carries into unsaved work what changed elsewhere in the files it left alone, so a save sends only its own", () => {
    const saved = withFile(withFile(presetDraft(), "custom.css", "a {}"), "components/x.css", "x {}");
    const edited = withFile(saved, "tokens/brand.css", ":root {}");
    const remote = withFile(withFile(withoutFile(saved, "components/x.css"), "custom.css", "theirs {}"), NAV, "n {}");
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
    expect(session.saved).toBe(remote);
    expect(session.draft.files[NAV]).toBe("n {}");
    expect(session.draft.files["custom.css"]).toBe("theirs {}");
    expect(Object.hasOwn(session.draft.files, "components/x.css")).toBe(false);
    expect(session.draft.files["tokens/brand.css"]).toBe(":root {}");
    expect(changedPaths(session.saved, session.draft)).toEqual(["tokens/brand.css"]);
    expect(removedPaths(session.saved, session.draft)).toEqual([]);
    expect(session.conflicts).toEqual([]);
    expect(isDirty(session)).toBe(true);
  });

  it("keeps the draft's text where both sides changed a file, and names only that file", () => {
    const saved = withFile(presetDraft(), "custom.css", "a {}");
    const edited = withFile(saved, "custom.css", "mine {}");
    const remote = withFile(withFile(saved, "custom.css", "theirs {}"), NAV, "n {}");
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
    expect(session.draft.files["custom.css"]).toBe("mine {}");
    expect(session.draft.files[NAV]).toBe("n {}");
    expect(session.conflicts).toEqual(["custom.css"]);
  });

  it("names a file the draft deleted that changed elsewhere, and one it changed that was deleted elsewhere", () => {
    const saved = withFile(withFile(presetDraft(), "custom.css", "a {}"), "components/x.css", "x {}");
    const edited = withFile(withoutFile(saved, "components/x.css"), "custom.css", "mine {}");
    const remote = withFile(withoutFile(saved, "custom.css"), "components/x.css", "x2 {}");
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
    expect(session.draft).toBe(edited);
    expect(session.conflicts).toEqual(["components/x.css", "custom.css"]);
  });

  it("follows a rename and a scheme change made elsewhere under other unsaved work", () => {
    const saved = presetDraft();
    const edited = withFile(saved, "custom.css", "mine {}");
    const remote = withMeta(saved, { name: "Theirs", scheme: "light", startedFrom: "ocean" });
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
    expect(session.draft.meta).toEqual(remote.meta);
    expect(session.draft.files["custom.css"]).toBe("mine {}");
  });

  it("keeps the draft's own rename over one made elsewhere, and still follows the other fields", () => {
    const saved = presetDraft();
    const edited = withMeta(saved, { name: "Mine again" });
    const remote = withMeta(saved, { name: "Theirs", scheme: "light" });
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
    expect(session.draft.meta.name).toBe("Mine again");
    expect(session.draft.meta.scheme).toBe("light");
  });

  it("merges the tokens that follow their base one by one", () => {
    const saved = withMeta(presetDraft(), { follows: ["--a", "--b", "--c"] });
    const edited = withMeta(saved, { follows: ["--a", "--c", "--mine"] });
    const remote = withMeta(saved, { follows: ["--b", "--c", "--theirs"] });
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
    expect(session.draft.meta.follows).toEqual(["--c", "--mine", "--theirs"]);
  });

  it("clears a notice once the server holds the draft's text for that file", () => {
    const saved = withFile(presetDraft(), "custom.css", "a {}");
    const edited = withFile(withFile(saved, "custom.css", "mine {}"), NAV, "n {}");
    let session = adoptSaved(
      editSession(openSession(saved, null), edited, STEP),
      withFile(saved, "custom.css", "theirs {}"),
      null,
      STEP * 2
    );
    expect(session.conflicts).toEqual(["custom.css"]);
    session = adoptSaved(session, withFile(saved, "custom.css", "mine {}"), null, STEP * 3);
    expect(session.conflicts).toEqual([]);
    expect(isDirty(session)).toBe(true);
  });

  it("does not call it a conflict when the server ended on the text the draft already has", () => {
    const saved = withFile(presetDraft(), "custom.css", "a {}");
    const edited = withFile(withFile(saved, "custom.css", "same {}"), "components/x.css", "x {}");
    const remote = withFile(saved, "custom.css", "same {}");
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
    expect(session.conflicts).toEqual([]);
  });
});

describe("undo after a change made elsewhere", () => {
  const saved = withFile(withFile(presetDraft(), "custom.css", "a {}"), "components/x.css", "x {}");
  const first = withFile(saved, "custom.css", "m1 {}");
  const second = withFile(first, "custom.css", "m2 {}");
  const remote = withFile(withFile(saved, "components/x.css", "x2 {}"), NAV, "n {}");

  function edited() {
    let session = editSession(openSession(saved, null), first, STEP);
    session = editSession(session, second, STEP * 2);
    return session;
  }

  it("steps back through this editor's own edits only, over the files as the server has them now", () => {
    let session = adoptSaved(edited(), remote, null, STEP * 3);
    session = undoSession(session);
    expect(session.draft.files["custom.css"]).toBe("m1 {}");
    expect(session.draft.files["components/x.css"]).toBe("x2 {}");
    expect(session.draft.files[NAV]).toBe("n {}");
    session = undoSession(session);
    expect(session.draft.files["custom.css"]).toBe("a {}");
    expect(removedPaths(session.saved, session.draft)).toEqual([]);
    expect(isDirty(session)).toBe(false);
    expect(undoSession(session)).toBe(session);
  });

  it("steps forward again over the files as the server has them now", () => {
    let session = undoSession(undoSession(edited()));
    session = adoptSaved(session, remote, null, STEP * 3);
    expect(isDirty(session)).toBe(false);
    session = redoSession(redoSession(session));
    expect(session.draft.files["custom.css"]).toBe("m2 {}");
    expect(session.draft.files["components/x.css"]).toBe("x2 {}");
    expect(changedPaths(session.saved, session.draft)).toEqual(["custom.css"]);
    expect(removedPaths(session.saved, session.draft)).toEqual([]);
  });

  it("undoes an edit made after the change elsewhere back onto the files as the server has them now", () => {
    let session = adoptSaved(edited(), remote, null, STEP * 3);
    session = editSession(session, withFile(session.draft, "custom.css", "m3 {}"), STEP * 4);
    session = undoSession(session);
    expect(session.draft.files["custom.css"]).toBe("m2 {}");
    expect(session.draft.files["components/x.css"]).toBe("x2 {}");
    expect(session.draft.files[NAV]).toBe("n {}");
  });

  it("leaves no step that changes nothing once the server caught up with an older state", () => {
    let session = editSession(openSession(saved, null), withFile(saved, NAV, "n {}"), STEP);
    session = adoptSaved(session, withFile(saved, NAV, "n {}"), null, STEP * 2);
    expect(isDirty(session)).toBe(false);
    expect(canUndo(session.undo)).toBe(false);
  });

  it("keeps a notice through an undo while the draft still differs in that file", () => {
    let session = adoptSaved(edited(), withFile(saved, "custom.css", "theirs {}"), null, STEP * 3);
    expect(session.conflicts).toEqual(["custom.css"]);
    session = undoSession(session);
    expect(session.draft.files["custom.css"]).toBe("m1 {}");
    expect(session.conflicts).toEqual(["custom.css"]);
  });

  it("drops the notice when an undo lands on the server's text for that file", () => {
    let session = editSession(edited(), withFile(second, "custom.css", "theirs {}"), STEP * 3);
    session = editSession(session, withFile(second, "custom.css", "m4 {}"), STEP * 4);
    session = adoptSaved(session, withFile(saved, "custom.css", "theirs {}"), null, STEP * 5);
    expect(session.conflicts).toEqual(["custom.css"]);
    session = undoSession(session);
    expect(session.draft.files["custom.css"]).toBe("theirs {}");
    expect(session.conflicts).toEqual([]);
  });
});

describe("settling a conflict", () => {
  const saved = withFile(presetDraft(), "custom.css", "a {}");
  const edited = withFile(saved, "custom.css", "mine {}");
  const remote = withFile(saved, "custom.css", "theirs {}");
  const conflicted = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);

  it("keeps the draft's text and clears the notice", () => {
    const session = keepMine(conflicted, "custom.css");
    expect(session.conflicts).toEqual([]);
    expect(session.draft.files["custom.css"]).toBe("mine {}");
  });

  it("loads the server's text as one step that undo reverses", () => {
    const session = takeTheirs(conflicted, "custom.css", STEP * 3);
    expect(session.conflicts).toEqual([]);
    expect(session.draft.files["custom.css"]).toBe("theirs {}");
    expect(isDirty(session)).toBe(false);
    expect(undoSession(session).draft.files["custom.css"]).toBe("mine {}");
  });

  it("removes a file the server no longer has", () => {
    const withExtra = withFile(saved, "components/x.css", "x {}");
    const mine = withFile(withExtra, "components/x.css", "mine {}");
    const session = adoptSaved(editSession(openSession(withExtra, null), mine, STEP), saved, null, STEP * 2);
    expect(session.conflicts).toEqual(["components/x.css"]);
    expect(Object.hasOwn(takeTheirs(session, "components/x.css", STEP * 3).draft.files, "components/x.css")).toBe(
      false
    );
  });
});
