import { describe, expect, it } from "vitest";

import { downloadSourceLabelKey } from "@utils/download-source";

describe("downloadSourceLabelKey", () => {
  it("names every download source", () => {
    expect(downloadSourceLabelKey("slskd")).toBe("quarantine.source.slskd");
    expect(downloadSourceLabelKey("ytdlp")).toBe("quarantine.source.ytdlp");
    expect(downloadSourceLabelKey("usenet")).toBe("quarantine.source.usenet");
  });

  it("returns null for a source it does not know, so the caller can show the raw value", () => {
    expect(downloadSourceLabelKey("napster")).toBeNull();
  });
});
