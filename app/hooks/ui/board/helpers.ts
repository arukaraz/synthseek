import {
  AUTOSCROLL_EDGE_PX,
  AUTOSCROLL_STEP_PX,
  BOARD_TILE_ATTRIBUTE,
  BOARD_TILE_SELECTOR,
  DRAG_GHOST_CLASS,
} from "./constants";
import type { BoardDragItem, BoxRect, DropTarget, PointerPoint, ScrollViewport, SlideResult } from "./types";

export function reorderAround<T extends BoardDragItem>(
  items: readonly T[],
  dragId: string,
  targetId: string,
  before: boolean
): T[] {
  const moving = items.find((item) => item.id === dragId);
  if (!moving || dragId === targetId) return [...items];
  const rest = items.filter((item) => item.id !== dragId);
  const at = rest.findIndex((item) => item.id === targetId);
  if (at === -1) return [...items];
  rest.splice(before ? at : at + 1, 0, moving);
  return rest;
}

export function swapItems<T extends BoardDragItem>(items: readonly T[], dragId: string, targetId: string): T[] {
  const from = items.findIndex((item) => item.id === dragId);
  const to = items.findIndex((item) => item.id === targetId);
  if (from === -1 || to === -1 || from === to) return [...items];
  const next = [...items];
  const dragged = next[from];
  const target = next[to];
  if (!dragged || !target) return [...items];
  next[from] = target;
  next[to] = dragged;
  return next;
}

export function sameTarget(a: DropTarget | null, b: DropTarget): boolean {
  return a !== null && a.id === b.id && a.before === b.before;
}

export function travelled(from: PointerPoint, to: PointerPoint): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function measureTiles(container: HTMLElement): Map<HTMLElement, DOMRect> {
  const tiles = Array.from(container.querySelectorAll(BOARD_TILE_SELECTOR));
  return new Map(
    tiles.flatMap((tile) => (tile instanceof HTMLElement ? [[tile, tile.getBoundingClientRect()] as const] : []))
  );
}

export function slideTiles(
  container: HTMLElement,
  previous: Map<HTMLElement, DOMRect>,
  skipId: string | null,
  durationMs: number,
  now: number
): SlideResult {
  const tiles = Array.from(container.querySelectorAll(BOARD_TILE_SELECTOR)).filter(
    (tile): tile is HTMLElement => tile instanceof HTMLElement
  );
  for (const tile of tiles) {
    tile.style.transition = "none";
    tile.style.transform = "";
  }
  const rects = new Map(tiles.map((tile) => [tile, tile.getBoundingClientRect()] as const));
  const moved: HTMLElement[] = [];
  for (const tile of tiles) {
    if (tile.dataset.boardTile === skipId) continue;
    const before = previous.get(tile);
    const after = rects.get(tile);
    if (!before || !after) continue;
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (dx === 0 && dy === 0) continue;
    tile.style.transform = `translate(${dx}px, ${dy}px)`;
    moved.push(tile);
  }
  if (moved.length === 0) return { rects, slidUntil: now };
  void container.offsetWidth;
  for (const tile of moved) {
    tile.style.transition = `transform ${durationMs}ms ease`;
    tile.style.transform = "";
  }
  return { rects, slidUntil: now + durationMs };
}

export function sameOrder(a: readonly BoardDragItem[], b: readonly BoardDragItem[]): boolean {
  return a.length === b.length && a.every((item, index) => item.id === b[index]?.id);
}

export function insertsBefore(target: BoxRect, pointer: PointerPoint, placeholder: BoxRect): boolean {
  const sharesRow = target.top < placeholder.top + placeholder.height && placeholder.top < target.top + target.height;
  if (sharesRow) return pointer.x < target.left + target.width / 2;
  return pointer.y < target.top + target.height / 2;
}

export function autoscrollDelta(pointerY: number, viewport: ScrollViewport): number {
  if (pointerY < viewport.top + AUTOSCROLL_EDGE_PX) return -AUTOSCROLL_STEP_PX;
  if (pointerY > viewport.bottom - AUTOSCROLL_EDGE_PX) return AUTOSCROLL_STEP_PX;
  return 0;
}

export function scrollParentOf(element: HTMLElement): HTMLElement {
  let node = element.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return document.documentElement;
}

export function viewportOf(scroller: HTMLElement): ScrollViewport {
  if (scroller === document.documentElement) return { top: 0, bottom: window.innerHeight };
  const rect = scroller.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom };
}

export function focusBoardTile(id: string): void {
  requestAnimationFrame(() => {
    const tile = document.querySelector(`[${BOARD_TILE_ATTRIBUTE}="${CSS.escape(id)}"]`);
    if (tile instanceof HTMLElement) tile.focus();
  });
}

export function placeGhost(ghost: HTMLElement, point: PointerPoint, offset: PointerPoint): void {
  ghost.style.left = `${point.x - offset.x}px`;
  ghost.style.top = `${point.y - offset.y}px`;
}

export function createGhost(tile: HTMLElement): HTMLElement | null {
  const clone = tile.cloneNode(true);
  if (!(clone instanceof HTMLElement)) return null;
  const rect = tile.getBoundingClientRect();
  clone.removeAttribute(BOARD_TILE_ATTRIBUTE);
  clone.removeAttribute("tabindex");
  clone.setAttribute("aria-hidden", "true");
  clone.className = `${tile.className} ${DRAG_GHOST_CLASS}`;
  clone.style.position = "fixed";
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  document.body.appendChild(clone);
  return clone;
}

export function tileUnderPointer(point: PointerPoint, exceptId: string): HTMLElement | null {
  for (const element of document.elementsFromPoint(point.x, point.y)) {
    const tile = element.closest(BOARD_TILE_SELECTOR);
    if (tile instanceof HTMLElement && tile.dataset.boardTile && tile.dataset.boardTile !== exceptId) return tile;
  }
  return null;
}
