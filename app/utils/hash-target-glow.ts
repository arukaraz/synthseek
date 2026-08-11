const ANCHOR_ATTR = "data-anchor-target";
const GLOW_ATTR = "data-glow";
const GLOW_DURATION_MS = 5000;
const WAIT_FOR_MOUNT_MS = 3000;

let activeCleanup: (() => void) | null = null;

function findAnchorTarget(hash: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[${ANCHOR_ATTR}="${CSS.escape(hash)}"]`);
}

function glowTarget(target: HTMLElement): () => void {
  target.scrollIntoView({ behavior: "smooth", block: "center" });
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
