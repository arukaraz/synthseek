import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearHashTargetGlow, hashTargetFromLocation, triggerHashTargetGlow } from "../hash-target-glow";

const GLOW_ATTR = "data-glow";

function mountTarget(anchor: string): HTMLElement {
  const element = document.createElement("div");
  element.setAttribute("data-anchor-target", anchor);
  document.body.appendChild(element);
  return element;
}

function flushObservers(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

describe("hash-target-glow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = vi.fn();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    clearHashTargetGlow();
    vi.useRealTimers();
  });

  it("marks a mounted target without any navigation or pathname change", () => {
    const target = mountTarget("ban-threshold");

    triggerHashTargetGlow("ban-threshold");

    expect(target.hasAttribute(GLOW_ATTR)).toBe(true);
    expect(target.scrollIntoView).toHaveBeenCalled();
  });

  it("re-marks the same target on a repeat activation after the glow expired", () => {
    const target = mountTarget("ban-threshold");

    triggerHashTargetGlow("ban-threshold");
    vi.advanceTimersByTime(5000);
    expect(target.hasAttribute(GLOW_ATTR)).toBe(false);

    triggerHashTargetGlow("ban-threshold");

    expect(target.hasAttribute(GLOW_ATTR)).toBe(true);
  });

  it("restarts the glow window when activated again while it is still lit", () => {
    const target = mountTarget("ban-threshold");

    triggerHashTargetGlow("ban-threshold");
    vi.advanceTimersByTime(4000);
    triggerHashTargetGlow("ban-threshold");
    vi.advanceTimersByTime(4000);

    expect(target.hasAttribute(GLOW_ATTR)).toBe(true);
  });

  it("ignores an empty hash", () => {
    const target = mountTarget("ban-threshold");

    triggerHashTargetGlow("");

    expect(target.hasAttribute(GLOW_ATTR)).toBe(false);
  });

  it("waits for a target that mounts after the activation", async () => {
    triggerHashTargetGlow("ban-threshold");

    const target = mountTarget("ban-threshold");
    await flushObservers();

    expect(target.hasAttribute(GLOW_ATTR)).toBe(true);
  });

  it("gives up waiting once the mount window closes", async () => {
    triggerHashTargetGlow("ban-threshold");
    vi.advanceTimersByTime(3000);

    const target = mountTarget("ban-threshold");
    await flushObservers();

    expect(target.hasAttribute(GLOW_ATTR)).toBe(false);
  });

  it("clears the glow on demand", () => {
    const target = mountTarget("ban-threshold");
    triggerHashTargetGlow("ban-threshold");

    clearHashTargetGlow();

    expect(target.hasAttribute(GLOW_ATTR)).toBe(false);
  });

  it("reads the current location hash without the leading marker", () => {
    window.location.hash = "#ban-threshold";

    expect(hashTargetFromLocation()).toBe("ban-threshold");

    window.location.hash = "";
  });
});
