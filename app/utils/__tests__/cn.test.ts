import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles single class string", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple class strings", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
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
    expect(cn("text-red-500 p-2", "bg-blue-500 p-4")).toBe("text-red-500 bg-blue-500 p-4");
  });

  it("handles complex nested conditions", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn("base", {
        "bg-blue-500": isActive,
        "opacity-50": isDisabled,
      })
    ).toBe("base bg-blue-500");
  });

  it("handles mixed inputs", () => {
    expect(cn("class1", ["class2", "class3"], { class4: true })).toBe(
      "class1 class2 class3 class4"
    );
  });
});
