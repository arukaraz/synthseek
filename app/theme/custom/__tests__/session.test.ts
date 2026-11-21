// @vitest-environment node
import { describe, expect, it } from "vitest";

import { UNDO_GROUP_MS } from "../constants";
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

function withFile(draft: ThemeDraft, path: string, text: string): ThemeDraft {
  return { ...draft, files: { ...draft.files, [path]: text } };
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
});

describe("the stored draft", () => {
  it("survives a round trip through the browser's storage", () => {
    const draft = withFile(presetDraft("ocean"), "components/nav.css", "b {}");
    expect(parseStoredDraft(serializeStoredDraft(draft, 77))).toEqual({ at: 77, draft });
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

  it("names a file the server cleaned on save when the draft has moved on from what was sent", () => {
    const saved = presetDraft();
    const sent = withFile(saved, "custom.css", "@import url(http://x); a {}");
    const later = withFile(sent, "components/nav.css", "n {}");
    let session = editSession(openSession(saved, null), sent, STEP);
    session = editSession(session, later, STEP * 2);
    const stored = withFile(presetDraft(), "custom.css", "a {}");
    expect(adoptSaved(session, stored, sent, STEP * 3).conflicts).toEqual(["custom.css"]);
  });

  it("follows a change made elsewhere while the draft has nothing unsaved", () => {
    const saved = presetDraft();
    const remote = withFile(saved, "custom.css", "c {}");
    const session = adoptSaved(openSession(saved, null), remote, null, STEP);
    expect(session.draft).toBe(remote);
    expect(session.conflicts).toEqual([]);
    expect(isDirty(session)).toBe(false);
  });

  it("keeps unsaved work and names the files that changed underneath it", () => {
    const saved = withFile(presetDraft(), "custom.css", "a {}");
    const edited = withFile(saved, "custom.css", "mine {}");
    const remote = withFile(withFile(saved, "custom.css", "theirs {}"), "components/nav.css", "n {}");
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
    expect(session.draft).toBe(edited);
    expect(session.saved).toBe(remote);
    expect(session.conflicts).toEqual(["components/nav.css", "custom.css"]);
  });

  it("does not call it a conflict when the server ended on the text the draft already has", () => {
    const saved = withFile(presetDraft(), "custom.css", "a {}");
    const edited = withFile(withFile(saved, "custom.css", "same {}"), "components/x.css", "x {}");
    const remote = withFile(saved, "custom.css", "same {}");
    const session = adoptSaved(editSession(openSession(saved, null), edited, STEP), remote, null, STEP * 2);
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
