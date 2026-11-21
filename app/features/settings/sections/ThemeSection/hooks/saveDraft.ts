import { isThemeChangedElsewhere } from "@hooks/api/mutations/theme";
import { errorToast } from "@modules/errors";
import { adoptSaved, changedPaths, isDirty, removedPaths } from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";

import { savedDraftOf } from "../helpers";
import type { SaveDeps, ThemeFilesData } from "../types";
import { patchEditor, readEditor, writeEditor } from "./editorStore";

function release(): void {
  patchEditor((latest) => ({ ...latest, sent: null, checked: {} }));
}

function adopt(fresh: ThemeFilesData, sent: ThemeDraft | null): void {
  patchEditor((latest) => ({
    ...latest,
    sent: null,
    revision: fresh.revision,
    session: adoptSaved(latest.session, savedDraftOf(fresh), sent, Date.now()),
  }));
}

async function saveOver(deps: SaveDeps, error: unknown, retry: boolean): Promise<void> {
  adopt(await deps.fetchFiles(), null);
  const merged = readEditor();
  if (merged === null || !isDirty(merged.session)) return;
  if (retry && merged.session.conflicts.length === 0) return saveDraft(deps, false);
  errorToast(error, "theme.saveFailed");
}

export async function saveDraft(deps: SaveDeps, retry: boolean): Promise<void> {
  const current = readEditor();
  if (current === null || current.sent !== null) return;
  const { saved, draft: sent } = current.session;
  writeEditor({ ...current, sent });
  try {
    await deps.saveTheme({
      base: current.revision,
      files: changedPaths(saved, sent).map((path) => ({ path, text: sent.files[path] })),
      remove: removedPaths(saved, sent),
      meta: sent.meta,
    });
  } catch (error) {
    if (!isThemeChangedElsewhere(error)) return release();
    return saveOver(deps, error, retry).catch(release);
  }
  try {
    adopt(await deps.fetchFiles(), sent);
  } catch {
    release();
  }
}
