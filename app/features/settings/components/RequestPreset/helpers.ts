import { presetFromSelection, selectionFromPreset } from "@features/search/components/ConfigRequestModal/helpers";
import type { DownloadSourceKey, RequestPreset } from "@features/search/components/ConfigRequestModal/types";

import type { RequestPresetDraft } from "./types";

export function presetDraft(
  own: RequestPreset | null,
  seed: RequestPreset,
  offered: DownloadSourceKey[]
): RequestPresetDraft {
  const preset = own ?? seed;
  const kept = (preset.sourceChain ?? []).filter((key) => !offered.includes(key));
  return { choice: own ? "custom" : "follow", selection: selectionFromPreset(preset, [...offered, ...kept]) };
}

export function presetFromDraft(draft: RequestPresetDraft): RequestPreset | null {
  return draft.choice === "custom" ? presetFromSelection(draft.selection) : null;
}
