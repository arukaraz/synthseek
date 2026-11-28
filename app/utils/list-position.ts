export interface ListPosition {
  setSize: number;
  posInSet: number;
}

export interface ListPositionAttributes {
  "aria-setsize"?: number;
  "aria-posinset"?: number;
}

export function listPositionOf(index: number, total: number, offset = 0): ListPosition {
  const posInSet = offset + index + 1;
  return { setSize: Math.max(total, posInSet), posInSet };
}

export function listPositionAttributes(position: ListPosition | undefined): ListPositionAttributes {
  if (position === undefined) return {};
  return { "aria-setsize": position.setSize, "aria-posinset": position.posInSet };
}
