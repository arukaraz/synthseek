import { describe, expect, it } from "vitest";

import { authInputRow, authPlexButton, authPlexIcon } from "../styles";

describe("authInputRow", () => {
  it("carries the destructive border alone when invalid", () => {
    const result = authInputRow({ invalid: true });
    expect(result).toContain("border-destructive");
    expect(result).toContain("focus-within:border-destructive");
    expect(result).toContain("focus-within:ring-destructive/30");
    expect(result).not.toContain("border-fg/15");
    expect(result).not.toContain("focus-within:border-primary-500");
    expect(result).not.toContain("focus-within:ring-primary-500/30");
  });

  it("carries the neutral border and the primary focus ring when valid", () => {
    const result = authInputRow({ invalid: false });
    expect(result).toContain("border-fg/15");
    expect(result).toContain("focus-within:border-primary-500");
    expect(result).toContain("focus-within:ring-primary-500/30");
    expect(result).not.toContain("border-destructive");
  });
});

describe("authPlexButton", () => {
  it("keeps the plex border on the idle and pending phases", () => {
    for (const phase of ["idle", "pending"] as const) {
      const result = authPlexButton({ phase });
      expect(result).toContain("border-plex-500/35");
      expect(result).toContain("hover:border-plex-500/55");
    }
  });

  it("drops every plex border once the phase carries its own", () => {
    for (const phase of ["completed", "error"] as const) {
      const result = authPlexButton({ phase });
      expect(result).not.toContain("border-plex-500/35");
      expect(result).not.toContain("hover:border-plex-500/55");
    }
    expect(authPlexButton({ phase: "completed" })).toContain("border-[oklch(var(--neon-success)/0.55)]");
    expect(authPlexButton({ phase: "error" })).toContain("border-destructive/60");
  });
});

describe("authPlexIcon", () => {
  it("tints with the plex color on the idle and pending phases", () => {
    for (const phase of ["idle", "pending"] as const) {
      expect(authPlexIcon({ phase })).toContain("text-plex-400");
    }
  });

  it("drops the plex tint once the phase carries its own color", () => {
    for (const phase of ["completed", "error"] as const) {
      expect(authPlexIcon({ phase })).not.toContain("text-plex-400");
    }
    expect(authPlexIcon({ phase: "completed" })).toContain("text-[oklch(var(--neon-success))]");
    expect(authPlexIcon({ phase: "error" })).toContain("text-destructive");
  });
});
