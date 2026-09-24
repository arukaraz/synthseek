import { describe, expect, it } from "vitest";

import { createPlayerDevice, createPlayerView } from "@test/factories";

import { moreAttention, panelClosesUpward, panelEdge } from "../helpers";
import type { PanelAnchorPoint } from "../types";

function point(below: boolean): PanelAnchorPoint {
  return { top: 80, bottom: 0, left: 1000, below, room: 600 };
}

describe("which edge a panel attaches to", () => {
  it("is the bar it rises from in the normal player", () => {
    expect(panelEdge(false, null, false)).toBe("bar");
    expect(panelEdge(true, null, false)).toBe("bar");
  });

  it("is the header it hangs from in the compact player", () => {
    expect(panelEdge(false, null, true)).toBe("header");
    expect(panelEdge(true, null, true)).toBe("header");
  });

  it("is neither once the panel is anchored to a toggle on the full screen stage", () => {
    expect(panelEdge(true, point(true), false)).toBe("floating");
    expect(panelEdge(true, point(false), true)).toBe("floating");
  });
});

describe("which way a panel closes", () => {
  it("closes downward into the bar and upward into the header", () => {
    expect(panelClosesUpward("bar", null)).toBe(false);
    expect(panelClosesUpward("header", null)).toBe(true);
  });

  it("closes towards the toggle a floating panel hangs from", () => {
    expect(panelClosesUpward("floating", point(true))).toBe(true);
    expect(panelClosesUpward("floating", point(false))).toBe(false);
    expect(panelClosesUpward("floating", null)).toBe(false);
  });
});

describe("what the more button has to announce", () => {
  const kitchen = createPlayerDevice({ id: "kitchen", name: "Kitchen", local: false, active: true });

  it("says nothing while the sound is here and scrobbling is fine", () => {
    expect(moreAttention(createPlayerView())).toBeNull();
    expect(moreAttention(createPlayerView({ scrobble: "sending" }))).toBeNull();
  });

  it("points at another device carrying the sound", () => {
    expect(moreAttention(createPlayerView({ activeDevice: kitchen }))).toBe("remote");
  });

  it("ranks a scrobbling problem above the remote device, failure above a retry", () => {
    expect(moreAttention(createPlayerView({ activeDevice: kitchen, scrobble: "retrying" }))).toBe("warning");
    expect(moreAttention(createPlayerView({ activeDevice: kitchen, scrobble: "failed" }))).toBe("danger");
  });
});
