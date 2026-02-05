import { describe, it, expect } from "vitest";
import { fadeIn, slideUp, scale, staggerItem, modalOverlay, modalContent } from "../animations";

describe("fadeIn", () => {
  it("has hidden state with opacity 0", () => {
    expect(fadeIn.hidden).toEqual({ opacity: 0 });
  });

  it("has visible state with opacity 1", () => {
    expect(fadeIn.visible).toHaveProperty("opacity", 1);
  });

  it("has exit state with opacity 0", () => {
    expect(fadeIn.exit).toHaveProperty("opacity", 0);
  });

  it("has transition in visible state", () => {
    expect(fadeIn.visible).toHaveProperty("transition");
  });
});

describe("slideUp", () => {
  it("has hidden state with y offset and opacity 0", () => {
    expect(slideUp.hidden).toEqual({ y: 20, opacity: 0 });
  });

  it("has visible state with y 0 and opacity 1", () => {
    expect(slideUp.visible).toHaveProperty("y", 0);
    expect(slideUp.visible).toHaveProperty("opacity", 1);
  });

  it("has exit state with y offset", () => {
    expect(slideUp.exit).toHaveProperty("y", 10);
    expect(slideUp.exit).toHaveProperty("opacity", 0);
  });

  it("has transition with easing in visible state", () => {
    expect(slideUp.visible).toHaveProperty("transition");
    expect((slideUp.visible as Record<string, unknown>).transition).toHaveProperty("ease");
  });
});

describe("scale", () => {
  it("has initial state with scale 1", () => {
    expect(scale.initial).toEqual({ scale: 1 });
  });

  it("has hover state with scale greater than 1", () => {
    expect(scale.hover).toHaveProperty("scale", 1.02);
  });

  it("has tap state with scale less than 1", () => {
    expect(scale.tap).toHaveProperty("scale", 0.98);
  });

  it("has transition in hover state", () => {
    expect(scale.hover).toHaveProperty("transition");
  });
});

describe("staggerItem", () => {
  it("has hidden state with y offset and opacity 0", () => {
    expect(staggerItem.hidden).toEqual({ y: 10, opacity: 0 });
  });

  it("has visible state with y 0 and opacity 1", () => {
    expect(staggerItem.visible).toHaveProperty("y", 0);
    expect(staggerItem.visible).toHaveProperty("opacity", 1);
  });

  it("has exit state", () => {
    expect(staggerItem.exit).toHaveProperty("y", 5);
    expect(staggerItem.exit).toHaveProperty("opacity", 0);
  });

  it("has transition with easeOut in visible state", () => {
    expect((staggerItem.visible as Record<string, unknown>).transition).toHaveProperty(
      "ease",
      "easeOut"
    );
  });
});

describe("modalOverlay", () => {
  it("has hidden state with opacity 0", () => {
    expect(modalOverlay.hidden).toEqual({ opacity: 0 });
  });

  it("has visible state with opacity 1", () => {
    expect(modalOverlay.visible).toHaveProperty("opacity", 1);
  });

  it("has exit state with opacity 0", () => {
    expect(modalOverlay.exit).toHaveProperty("opacity", 0);
  });

  it("has transition duration in visible state", () => {
    expect((modalOverlay.visible as Record<string, unknown>).transition).toHaveProperty("duration");
  });
});

describe("modalContent", () => {
  it("has hidden state with scale, opacity, and y", () => {
    expect(modalContent.hidden).toHaveProperty("scale", 0.95);
    expect(modalContent.hidden).toHaveProperty("opacity", 0);
    expect(modalContent.hidden).toHaveProperty("y", 20);
  });

  it("has visible state with scale 1, opacity 1, and y 0", () => {
    expect(modalContent.visible).toHaveProperty("scale", 1);
    expect(modalContent.visible).toHaveProperty("opacity", 1);
    expect(modalContent.visible).toHaveProperty("y", 0);
  });

  it("has exit state matching hidden values", () => {
    expect(modalContent.exit).toHaveProperty("scale", 0.95);
    expect(modalContent.exit).toHaveProperty("opacity", 0);
    expect(modalContent.exit).toHaveProperty("y", 20);
  });

  it("has spring transition in visible state", () => {
    expect((modalContent.visible as Record<string, unknown>).transition).toHaveProperty(
      "type",
      "spring"
    );
  });

  it("has stiffness and damping in visible transition", () => {
    const transition = (modalContent.visible as Record<string, unknown>).transition as Record<
      string,
      unknown
    >;
    expect(transition).toHaveProperty("stiffness");
    expect(transition).toHaveProperty("damping");
  });
});
