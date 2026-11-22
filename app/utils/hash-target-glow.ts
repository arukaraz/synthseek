const ANCHOR_ATTR = "data-anchor-target";
const GLOW_ATTR = "data-glow";
const GLOW_DURATION_MS = 5000;
const WAIT_FOR_MOUNT_MS = 3000;
const SCROLLER_ATTR = "data-glow-scroller";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let activeCleanup: (() => void) | null = null;

function findAnchorTarget(hash: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${ANCHOR_ATTR}="${CSS.escape(hash)}"]`);
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function offsetWithin(target: HTMLElement, scroller: HTMLElement): number {
  let top = 0;
  let node: Element | null = target;
  while (node instanceof HTMLElement && node !== scroller) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  return top;
}

function centerInScroller(target: HTMLElement, scroller: HTMLElement): void {
  const slack = Math.max(0, (scroller.clientHeight - target.offsetHeight) / 2);
  scroller.scrollTo({
    top: Math.max(0, offsetWithin(target, scroller) - slack),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  target.focus({ preventScroll: true });
}

function revealTarget(target: HTMLElement): void {
  const scroller = target.closest<HTMLElement>(`[${SCROLLER_ATTR}]`);
  if (scroller) {
    centerInScroller(target, scroller);
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function glowTarget(target: HTMLElement): () => void {
  revealTarget(target);
  target.setAttribute(GLOW_ATTR, "true");
  const timer = window.setTimeout(() => target.removeAttribute(GLOW_ATTR), GLOW_DURATION_MS);

  return () => {
    window.clearTimeout(timer);
    target.removeAttribute(GLOW_ATTR);
  };
}

export function hashTargetFromLocation(): string {
  const { hash } = window.location;
  return hash.startsWith("#") ? hash.slice(1) : hash;
}

export function clearHashTargetGlow(): void {
  activeCleanup?.();
  activeCleanup = null;
}

export function triggerHashTargetGlow(hash: string): void {
  clearHashTargetGlow();
  if (!hash) return;

  const mounted = findAnchorTarget(hash);
  if (mounted) {
    activeCleanup = glowTarget(mounted);
    return;
  }

  let giveUp = 0;
  const observer = new MutationObserver(() => {
    const target = findAnchorTarget(hash);
    if (!target) return;
    observer.disconnect();
    window.clearTimeout(giveUp);
    activeCleanup = glowTarget(target);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  giveUp = window.setTimeout(() => observer.disconnect(), WAIT_FOR_MOUNT_MS);
  activeCleanup = () => {
    window.clearTimeout(giveUp);
    observer.disconnect();
  };
}
