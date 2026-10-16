export function movedKey<K extends string>(order: readonly K[], key: K, offset: -1 | 1): K[] {
  const index = order.indexOf(key);
  const target = index + offset;
  if (index === -1 || target < 0 || target >= order.length) return [...order];
  const next = [...order];
  next.splice(index, 1);
  next.splice(target, 0, key);
  return next;
}
