import { describe, expect, it } from "vitest";

import { modalCenterContainer, popoverLayer } from "@components/ui/styles";

import { PANEL_WIDTH_PX, SETTINGS_PANEL_WIDTH_PX } from "../constants";
import { panelAnchor, panelSurface, stage } from "../styles";

function layerOf(classes: string): number {
  const layer = classes.split(" ").find((token) => token.startsWith("z-"));
  if (layer === undefined) throw new Error(`no layer in ${classes}`);
  return Number(layer.slice(2));
}

describe("the anchored panel widths", () => {
  it("clamps the devices panel to the same width the class paints it at", () => {
    expect(panelAnchor({ width: "devices" })).toContain(`sm:w-[${PANEL_WIDTH_PX}px]`);
  });

  it("clamps the playback settings panel to the same width the class paints it at", () => {
    expect(panelAnchor({ width: "settings" })).toContain(`sm:w-[${SETTINGS_PANEL_WIDTH_PX}px]`);
  });
});

describe("the edge a panel is attached to", () => {
  it("drops the bottom border when the panel rises from the bar", () => {
    const classes = panelSurface({ edge: "bar" });
    expect(classes).toContain("border-b-0");
    expect(classes).not.toContain("border-t-0");
  });

  it("drops the top border and its rounding instead when the panel hangs from the header", () => {
    const classes = panelSurface({ edge: "header" });
    expect(classes).toContain("sm:border-t-0");
    expect(classes).toContain("sm:rounded-t-none");
    expect(classes).not.toContain("border-b-0");
  });

  it("keeps every border on a panel floating clear of both", () => {
    const classes = panelSurface({ edge: "floating" });
    expect(classes).not.toContain("border-t-0");
    expect(classes).not.toContain("border-b-0");
  });
});

describe("a menu opened from inside the player", () => {
  it("paints above the anchored panels, which is where its trigger lives", () => {
    expect(layerOf(popoverLayer)).toBeGreaterThan(layerOf(panelAnchor({ width: "settings" })));
  });

  it("paints above the full screen stage and the centred modal too", () => {
    expect(layerOf(popoverLayer)).toBeGreaterThan(layerOf(stage()));
    expect(layerOf(popoverLayer)).toBeGreaterThan(layerOf(modalCenterContainer({ z: "modal" })));
  });
});
