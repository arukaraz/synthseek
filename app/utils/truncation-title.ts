export const AUTO_TITLE_ATTRIBUTE = "data-auto-title";

const ANCESTOR_REACH = 6;

function isCutOff(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  if (style.textOverflow === "ellipsis" && element.scrollWidth > element.clientWidth) return true;
  const clamp = style.getPropertyValue("-webkit-line-clamp");
  return clamp !== "" && clamp !== "none" && element.scrollHeight > element.clientHeight;
}

function textOf(element: HTMLElement): string {
  return (element.textContent ?? "").trim();
}

export function truncatedAncestorOf(target: EventTarget | null): HTMLElement | null {
  let current = target instanceof HTMLElement ? target : null;
  for (let step = 0; current !== null && step < ANCESTOR_REACH; step += 1) {
    if (current === document.body) return null;
    const style = getComputedStyle(current);
    const clamps = style.getPropertyValue("-webkit-line-clamp");
    if (style.textOverflow === "ellipsis" || (clamps !== "" && clamps !== "none")) return current;
    current = current.parentElement;
  }
  return null;
}

export function syncTruncationTitle(element: HTMLElement): void {
  const ours = element.hasAttribute(AUTO_TITLE_ATTRIBUTE);
  if (element.hasAttribute("title") && !ours) return;
  if (isCutOff(element)) {
    const text = textOf(element);
    if (text === "") return;
    element.setAttribute("title", text);
    element.setAttribute(AUTO_TITLE_ATTRIBUTE, "");
    return;
  }
  if (ours) {
    element.removeAttribute("title");
    element.removeAttribute(AUTO_TITLE_ATTRIBUTE);
  }
}

export function handleTruncationHover(event: Event): void {
  const element = truncatedAncestorOf(event.target);
  if (element !== null) syncTruncationTitle(element);
}
