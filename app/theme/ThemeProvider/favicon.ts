import {
  LOGO_BODY_PATH,
  LOGO_END_TOKEN,
  LOGO_GRADIENT_LINE,
  LOGO_HEIGHT,
  LOGO_HOLE_PATHS,
  LOGO_START_TOKEN,
  LOGO_WIDTH,
} from "@components/ui/LogoIcon/constants";

import { THEME_CHANGE_EVENT, THEME_ICON_SELECTOR, THEME_ICON_SIZE, THEME_ICON_TYPE } from "./constants";

export function drawThemeIcon(target: Document): string | null {
  const view = target.defaultView;
  if (view === null) return null;
  const styles = view.getComputedStyle(target.documentElement);
  const start = styles.getPropertyValue(LOGO_START_TOKEN).trim();
  const end = styles.getPropertyValue(LOGO_END_TOKEN).trim();
  if (start === "" || end === "") return null;
  const canvas = target.createElement("canvas");
  canvas.width = THEME_ICON_SIZE;
  canvas.height = THEME_ICON_SIZE;
  try {
    const context = canvas.getContext("2d");
    if (context === null) return null;
    const scale = THEME_ICON_SIZE / LOGO_HEIGHT;
    context.translate((THEME_ICON_SIZE - LOGO_WIDTH * scale) / 2, 0);
    context.scale(scale, scale);
    const { x1, y1, x2, y2 } = LOGO_GRADIENT_LINE;
    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    context.fillStyle = gradient;
    context.fill(new Path2D(LOGO_BODY_PATH));
    context.globalCompositeOperation = "destination-out";
    for (const hole of LOGO_HOLE_PATHS) context.fill(new Path2D(hole));
    return canvas.toDataURL(THEME_ICON_TYPE);
  } catch {
    return null;
  }
}

export function applyThemeIcon(target: Document, draw: (target: Document) => string | null = drawThemeIcon): void {
  const href = draw(target);
  if (href === null) return;
  target.querySelectorAll<HTMLLinkElement>(THEME_ICON_SELECTOR).forEach((link) => {
    if (link.getAttribute("href") === href) return;
    link.setAttribute("href", href);
    link.setAttribute("type", THEME_ICON_TYPE);
    link.setAttribute("sizes", `${THEME_ICON_SIZE}x${THEME_ICON_SIZE}`);
  });
}

export function followThemeIcon(target: Document): () => void {
  const view = target.defaultView;
  if (view === null) return () => undefined;
  let frame = 0;
  const schedule = () => {
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => applyThemeIcon(target));
  };
  const observer = new view.MutationObserver(schedule);
  observer.observe(target.head, { childList: true });
  target.addEventListener(THEME_CHANGE_EVENT, schedule);
  schedule();
  return () => {
    view.cancelAnimationFrame(frame);
    observer.disconnect();
    target.removeEventListener(THEME_CHANGE_EVENT, schedule);
  };
}
