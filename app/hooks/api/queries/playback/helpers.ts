export function soonestListeningEnd(rows: readonly { remainingMs: number | null }[] | undefined): number | null {
  let soonest: number | null = null;
  for (const row of rows ?? []) {
    if (row.remainingMs === null) continue;
    if (soonest === null || row.remainingMs < soonest) soonest = row.remainingMs;
  }
  return soonest;
}
