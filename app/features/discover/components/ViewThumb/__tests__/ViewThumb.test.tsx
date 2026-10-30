import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createWidgetCatalog } from "@test/factories";

import { viewThumbMarks } from "../helpers";
import { ViewThumb } from "../ViewThumb";

function blocks() {
  return createWidgetCatalog().blocks.map((block) => block.key);
}

describe("ViewThumb", () => {
  it("gives every view a drawing of its own", () => {
    const drawings = blocks().map((block) => JSON.stringify(viewThumbMarks(block)));

    expect(drawings.every((drawing) => drawing !== "[]")).toBe(true);
    expect(new Set(drawings).size).toBe(drawings.length);
  });

  it("keeps every mark inside the drawing", () => {
    for (const block of blocks()) {
      for (const mark of viewThumbMarks(block)) {
        if (mark.kind !== "box") continue;
        expect(mark.x + mark.width).toBeLessThanOrEqual(100);
        expect(mark.y + mark.height).toBeLessThanOrEqual(40);
      }
    }
  });

  it("is decoration, hidden from assistive technology", () => {
    const { container } = render(<ViewThumb block="story" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("circle")).toHaveLength(4);
  });
});
