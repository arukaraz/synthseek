export function privateSessionActive(until: Date | null | undefined, now: number): boolean {
  return until !== null && until !== undefined && until.getTime() > now;
}
