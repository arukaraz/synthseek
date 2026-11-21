import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles single class string", () => {
    expect(cn("text-fg")).toBe("text-fg");
  });

  it("merges multiple class strings", () => {
    expect(cn("text-fg", "bg-surface")).toBe("text-fg bg-surface");
  });

  it("handles conditional classes with object syntax", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("handles array of classes", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
  });

  it("ignores undefined values", () => {
    expect(cn("class1", undefined, "class2")).toBe("class1 class2");
  });

  it("ignores null values", () => {
    expect(cn("class1", null, "class2")).toBe("class1 class2");
  });

  it("ignores false values", () => {
    expect(cn("class1", false, "class2")).toBe("class1 class2");
  });

  it("resolves Tailwind class conflicts with last class winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("resolves complex Tailwind conflicts", () => {
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
  });

  it("preserves non-conflicting classes", () => {
    expect(cn("text-fg p-2", "bg-surface p-4")).toBe("text-fg bg-surface p-4");
  });

  it("keeps a numeric text step beside a text color, and lets a later step replace it", () => {
    expect(cn("text-11", "text-fg-muted")).toBe("text-11 text-fg-muted");
    expect(cn("text-11", "text-13")).toBe("text-13");
    expect(cn("text-sm", "text-12")).toBe("text-12");
  });

  it("resolves a named tracking step against a default one", () => {
    expect(cn("tracking-wide", "tracking-caps")).toBe("tracking-caps");
    expect(cn("tracking-label", "tracking-caps-wide")).toBe("tracking-caps-wide");
  });

  it("keeps a named shadow beside a shadow color, and lets a later named shadow replace it", () => {
    expect(cn("shadow-float", "shadow-veil/40")).toBe("shadow-float shadow-veil/40");
    expect(cn("shadow-glass", "shadow-float")).toBe("shadow-float");
  });

  it("handles complex nested conditions", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn("base", {
        "bg-surface": isActive,
        "opacity-50": isDisabled,
      })
    ).toBe("base bg-surface");
  });

  it("handles mixed inputs", () => {
    expect(cn("class1", ["class2", "class3"], { class4: true })).toBe("class1 class2 class3 class4");
  });
});
