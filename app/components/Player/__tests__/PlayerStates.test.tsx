import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPlayerActions, createPlayerView } from "@test/factories";

import { PlayGlyph } from "../PlayGlyph";
import { PlayerVolume } from "../PlayerVolume";
import { ScrobbleStatus } from "../ScrobbleStatus";
import type { PlayerScrobbleState } from "../types";

const accessibility = vi.hoisted(() => ({ mode: false }));

vi.mock("@modules/providers/AccessibilityProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/providers/AccessibilityProvider")>();
  return { ...actual, useAccessibility: () => ({ ...actual.useAccessibility(), mode: accessibility.mode }) };
});

beforeEach(() => {
  accessibility.mode = false;
});

function glyphOf(overrides: Parameters<typeof createPlayerView>[0]) {
  const { container } = render(<PlayGlyph view={createPlayerView(overrides)} spin="size-4" face="size-4" />);
  return container.querySelector("svg");
}

describe("a playback error that stays on view", () => {
  it("keeps the play glyph with the mode off, exactly as today", () => {
    expect(glyphOf({ failing: true, playing: false })?.getAttribute("class")).toContain("lucide-play");
  });

  it("shows a warning in place of the play glyph with the mode on", () => {
    accessibility.mode = true;

    expect(glyphOf({ failing: true, playing: false })?.getAttribute("class")).toContain("lucide-triangle-alert");
  });

  it("still shows the spinner while it is loading, even when the last try failed", () => {
    accessibility.mode = true;

    expect(glyphOf({ failing: true, loading: true })?.getAttribute("class")).toContain("animate-spin");
  });
});

describe("a volume at zero", () => {
  function iconOf(volume: number, muted: boolean) {
    const { container } = render(
      <PlayerVolume view={createPlayerView({ volume, muted })} actions={createPlayerActions()} size="bar" />
    );
    return container.querySelector("button svg")?.getAttribute("class") ?? "";
  }

  it("keeps the speaker icon with the mode off", () => {
    expect(iconOf(0, false)).toContain("lucide-volume2");
  });

  it("shows the crossed speaker with the mode on", () => {
    accessibility.mode = true;

    expect(iconOf(0, false)).toContain("lucide-volume-x");
  });

  it("keeps the speaker while there is level to hear", () => {
    accessibility.mode = true;

    expect(iconOf(0.4, false)).toContain("lucide-volume2");
  });
});

describe("the scrobble state", () => {
  const STATES: PlayerScrobbleState[] = ["off", "sending", "retrying", "failed"];

  it("draws a different sign for each state, shown only inside the mode", () => {
    const signs = STATES.map((state) => {
      const { container, unmount } = render(
        <ScrobbleStatus state={state} actionable={false} lock={null} size="bar" onToggle={() => undefined} />
      );
      const sign = container.querySelector("svg.a11y-mode\\:block");
      const shape = sign?.getAttribute("class") ?? "";
      expect(shape).toContain("hidden");
      unmount();
      return shape.split(" ").find((token) => token.startsWith("lucide-") && token !== "lucide");
    });

    expect(new Set(signs).size).toBe(STATES.length);
  });
});
