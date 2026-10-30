import {
  AUTOSCROLL_EDGE_PX,
  AUTOSCROLL_STEP_PX,
  BOARD_FLIP_EASING,
  BOARD_FLIP_MS,
  BOARD_FLIP_SETTLE_MS,
  BOARD_TILE_ATTRIBUTE,
  BOARD_TILE_SELECTOR,
  DRAG_GHOST_CLASS,
  DRAG_LAND_MS,
  DRAG_LIFT_MS,
} from "./constants";
import type {
  BoardDragItem,
  BoxRect,
  DropTarget,
  OpenSpace,
  PointerPoint,
  ScrollViewport,
  SlideResult,
  TileBox,
  TilePosition,
} from "./types";

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
  rest.splice(before ? at : at + 1, 0, { ...moving, newRow: undefined });
  return rest;
}

export function moveToNewRow<T extends BoardDragItem>(items: readonly T[], dragId: string): T[] {
  const moving = items.find((item) => item.id === dragId);
  if (!moving) return [...items];
  return [...items.filter((item) => item.id !== dragId), { ...moving, newRow: true }];
}

export function swapItems<T extends BoardDragItem>(items: readonly T[], dragId: string, targetId: string): T[] {
  const from = items.findIndex((item) => item.id === dragId);
  const to = items.findIndex((item) => item.id === targetId);
  if (from === -1 || to === -1 || from === to) return [...items];
  const next = [...items];
  const dragged = next[from];
  const target = next[to];
  if (!dragged || !target) return [...items];
  next[from] = { ...target, newRow: dragged.newRow };
  next[to] = { ...dragged, newRow: target.newRow };
  return next;
}

export function sameTarget(a: DropTarget | null, b: DropTarget): boolean {
  if (a === null || a.kind !== b.kind) return false;
  return a.kind === "newRow" || b.kind === "newRow" || (a.id === b.id && a.before === b.before);
}

function contains(box: BoxRect, point: PointerPoint): boolean {
  return (
    point.x >= box.left && point.x <= box.left + box.width && point.y >= box.top && point.y <= box.top + box.height
  );
}

function comesBefore(tile: BoxRect, point: PointerPoint): boolean {
  if (tile.top > point.y) return false;
  return tile.top + tile.height <= point.y || tile.left <= point.x;
}

export function openSpaceTarget(point: PointerPoint, space: OpenSpace): DropTarget | null {
  const { tiles, grid, viewport, placeholder } = space;
  if (contains(placeholder, point)) return null;
  if (point.x < grid.left || point.x > grid.left + grid.width) return null;
  if (point.y < grid.top || point.y > viewport.bottom) return null;
  if (tiles.length === 0) return null;
  const bottom = Math.max(...tiles.map((tile) => tile.rect.top + tile.rect.height));
  if (point.y > bottom) return { kind: "newRow" };
  const previous = tiles.findLast((tile) => comesBefore(tile.rect, point));
  if (previous) return { kind: "space", id: previous.id, before: false };
  const [first] = tiles;
  return first ? { kind: "space", id: first.id, before: true } : null;
}

export function tileBoxes(container: ParentNode, ids: readonly string[]): TileBox[] {
  return ids.flatMap((id) => {
    const tile = container.querySelector(`[${BOARD_TILE_ATTRIBUTE}="${CSS.escape(id)}"]`);
    return tile ? [{ id, rect: tile.getBoundingClientRect() }] : [];
  });
}

export function travelled(from: PointerPoint, to: PointerPoint): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function measureTiles(container: HTMLElement): Map<HTMLElement, TilePosition> {
  const tiles = Array.from(container.querySelectorAll(BOARD_TILE_SELECTOR));
  return new Map(
    tiles.flatMap((tile) =>
      tile instanceof HTMLElement ? [[tile, { left: tile.offsetLeft, top: tile.offsetTop }] as const] : []
    )
  );
}

export function slideTiles(
  container: HTMLElement,
  previous: Map<HTMLElement, TilePosition>,
  skipId: string | null,
  now: number
): SlideResult {
  const rects = measureTiles(container);
  let moved = false;
  for (const [tile, after] of rects) {
    if (tile.dataset.boardTile === skipId) continue;
    const before = previous.get(tile);
    if (!before) continue;
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (dx === 0 && dy === 0) continue;
    moved = true;
    tile.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0px, 0px)" }], {
      duration: BOARD_FLIP_MS,
      easing: BOARD_FLIP_EASING,
      composite: "add",
    });
  }
  return { rects, slidUntil: moved ? now + BOARD_FLIP_SETTLE_MS : now };
}

export function sameOrder(a: readonly BoardDragItem[], b: readonly BoardDragItem[]): boolean {
  return (
    a.length === b.length &&
    a.every((item, index) => item.id === b[index]?.id && Boolean(item.newRow) === Boolean(b[index]?.newRow))
  );
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

export function clipParentOf(element: HTMLElement): HTMLElement {
  let node = element.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return document.documentElement;
}

export function viewportOf(scroller: HTMLElement): ScrollViewport {
  if (scroller === document.documentElement) return { top: 0, bottom: window.innerHeight };
  const rect = scroller.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom };
}

export function focusBoardTile(id: string, within: ParentNode = document): void {
  requestAnimationFrame(() => {
    const tile = within.querySelector(`[${BOARD_TILE_ATTRIBUTE}="${CSS.escape(id)}"]`);
    if (tile instanceof HTMLElement) tile.focus();
  });
}

function ghostTransform(left: number, top: number): string {
  return `translate3d(${left}px, ${top}px, 0)`;
}

export function placeGhost(ghost: HTMLElement, point: PointerPoint, offset: PointerPoint): void {
  ghost.style.transform = ghostTransform(point.x - offset.x, point.y - offset.y);
}

export function liftGhost(ghost: HTMLElement): void {
  ghost.animate([{ rotate: "0deg", scale: "1" }, {}], { duration: DRAG_LIFT_MS, easing: BOARD_FLIP_EASING });
}

export function landGhost(ghost: HTMLElement, slot: BoxRect): Animation {
  return ghost.animate(
    [
      { transform: ghost.style.transform },
      { transform: ghostTransform(slot.left, slot.top), rotate: "0deg", scale: "1" },
    ],
    { duration: DRAG_LAND_MS, easing: BOARD_FLIP_EASING, fill: "forwards" }
  );
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
  clone.style.left = "0px";
  clone.style.top = "0px";
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  document.body.appendChild(clone);
  return clone;
}

export function tileUnderPointer(point: PointerPoint, exceptId: string, within: Node | null): HTMLElement | null {
  for (const element of document.elementsFromPoint(point.x, point.y)) {
    const tile = element.closest(BOARD_TILE_SELECTOR);
    if (
      tile instanceof HTMLElement &&
      tile.dataset.boardTile &&
      tile.dataset.boardTile !== exceptId &&
      within?.contains(tile)
    ) {
      return tile;
    }
  }
  return null;
}
