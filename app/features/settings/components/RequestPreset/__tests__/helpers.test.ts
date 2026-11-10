import { describe, expect, it } from "vitest";

import type { RequestPreset } from "@features/search/components/ConfigRequestModal/types";

import { presetDraft, presetFromDraft } from "../helpers";

const FACTORY: RequestPreset = {
  bitrate: { value: 320, matching: "flexible" },
  format: { value: "mp3", matching: "flexible" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
};

describe("presetDraft", () => {
  it("keeps a source of the saved chain that is switched off today, so saving again does not drop it", () => {
    const own: RequestPreset = { ...FACTORY, sourceChain: ["usenet", "slskd"] };

    const draft = presetDraft(own, FACTORY, ["slskd", "ytdlp"]);

    expect(presetFromDraft(draft)?.sourceChain).toEqual(["usenet", "slskd"]);
  });

  it("starts a user without a preset on the seed, following", () => {
    const draft = presetDraft(null, FACTORY, ["slskd"]);

    expect(draft.choice).toBe("follow");
    expect(presetFromDraft(draft)).toBeNull();
  });
});
