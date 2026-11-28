import { LONG_PRESS_CLICK_GRACE_MS, LONG_PRESS_IGNORED_SELECTOR, ROW_PRIMARY_ATTRIBUTE } from "./constants";
import type { ScrollAxis, ScrollEdges, ScrollMetrics, SetupTarget, SetupTargetInput } from "./types";

export function setupTargetOf({
  context,
  setupRequired,
  tokenRequired,
  signedIn,
  isAdmin,
}: SetupTargetInput): SetupTarget {
  if (context === "app") {
    if (signedIn) return "stay";
    if (!setupRequired) return "loginBack";
    return tokenRequired ? "setup" : "loginToSetup";
  }
  if (context === "login") {
    if (signedIn) return "returnPath";
    return setupRequired && tokenRequired ? "setup" : "stay";
  }
  if (!setupRequired) return "home";
  if (!signedIn) return tokenRequired ? "stay" : "loginBack";
  return isAdmin ? "stay" : "home";
}

export function swallowNextClick(): void {
  let grace: number | null = null;
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    release();
  };
  const releaseSoon = () => {
    if (grace === null) grace = window.setTimeout(release, LONG_PRESS_CLICK_GRACE_MS);
  };
  const release = () => {
    if (grace !== null) window.clearTimeout(grace);
    window.removeEventListener("click", swallow, true);
    window.removeEventListener("pointerdown", release, true);
    window.removeEventListener("pointerup", releaseSoon, true);
    window.removeEventListener("pointercancel", releaseSoon, true);
  };
  window.addEventListener("click", swallow, true);
  window.addEventListener("pointerdown", release, true);
  window.addEventListener("pointerup", releaseSoon, true);
  window.addEventListener("pointercancel", releaseSoon, true);
}

export function startsLongPress(target: EventTarget | null, holder: HTMLElement): boolean {
  if (!(target instanceof Element) || !holder.contains(target)) return false;
  const control = target.closest(LONG_PRESS_IGNORED_SELECTOR);
  if (control === null || control === holder || !holder.contains(control)) return true;
  return control.hasAttribute(ROW_PRIMARY_ATTRIBUTE);
}

export function canStartSheetDrag(target: EventTarget | null, boundary: HTMLElement): boolean {
  if (!(target instanceof Element)) return false;
  let node: Element | null = target;
  while (node && node !== boundary) {
    if (node instanceof HTMLElement && node.scrollTop > 0) {
      const { overflowY } = getComputedStyle(node);
      if (overflowY === "auto" || overflowY === "scroll") return false;
    }
    node = node.parentElement;
  }
  return true;
}

export function scrollEdgesOf(metrics: ScrollMetrics, axis: ScrollAxis, tolerance: number): ScrollEdges {
  const offset = axis === "x" ? Math.abs(metrics.scrollLeft) : metrics.scrollTop;
  const visible = axis === "x" ? metrics.clientWidth : metrics.clientHeight;
  const total = axis === "x" ? metrics.scrollWidth : metrics.scrollHeight;
  return { start: offset > tolerance, end: offset + visible < total - tolerance };
}
